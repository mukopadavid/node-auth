const { OAuth2Client } = require("google-auth-library");
const db = require("../db/connection");
const User = require("../models/auth.model");
const redis_client = require("../helpers/init_redis");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../helpers/json_helpers");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  const { name, email, password } = req.body;

  !name ||
    !email ||
    (!password &&
      res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      }));

  try {
    const doesExist = await User.findOne({ email });

    doesExist &&
      res.status(403).json({
        success: false,
        message: "The email is already in use by another account",
      });

    const newUser = new User({
      name,
      email,
      password,
    });

    const user = await newUser.save();

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    redis_client.set(
      user._id.toString(),
      refreshToken.toString(),
      "EX",
      30 * 24 * 60 * 60,
      (err, reply) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "internal server error" });

        res.cookie("accessToken", accessToken, { httpOnly: true });
        res.cookie("refreshToken", refreshToken, { httpOnly: true });

        res.json({ success: true, message: "Registration successfull" });
      }
    );
  } catch (err) {
    console.log("The error " + err.message);
  }
};

//! User logging
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: "Please enter all the required fields",
    });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Wrong email or password" });

    const passwordMatch = await user.matchPasswords(password);

    if (!passwordMatch)
      return res
        .status(403)
        .json({ success: false, message: "Wrong email or password" });

    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    //! saving the refresh token to redis

    const userId = user._id;

    redis_client.set(
      userId.toString(),
      refreshToken.toString(),
      "EX",
      30 * 24 * 60 * 60,
      async (err) => {
        err &&
          res
            .status(500)
            .json({ success: false, message: "internal server error" });

        user.last_login = Date.now();
        await user.save();

        res.cookie("accessToken", accessToken, { httpOnly: true });
        res.cookie("refreshToken", refreshToken, { httpOnly: true });

        res.status(200).json({ success: true, message: "login successfull" });
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

//! google login
const google_login = (req, res) => {
  const { tokenId } = req.body;

  !tokenId &&
    res.status(403).json({ success: false, message: "No token id received" });

  client
    .verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      const { email_verified, name, email, picture } = response.payload;

      User.findOne({ email })
        .then(async (user) => {
          if (user) {
            //! logging a user via google login
            const accessToken = await createAccessToken(user);
            const refreshToken = await createRefreshToken(user);

            redis_client.set(
              user._id.toString(),
              refreshToken.toString(),
              "EX",
              30 * 24 * 60 * 60,
              async (err) => {
                console.log(err);
                if (err)
                  return res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });

                user.last_login = Date.now();
                await user.save();

                res.cookie("accessToken", accessToken);
                res.cookie("refreshToken", refreshToken);
                res.status(200).json({
                  success: true,
                  data: {
                    name: user.name,
                    email: user.email,
                    imageUrl: user.profilePicture,
                  },
                });

                //! end of logging a user via google
              }
            );
          } else {
            //! registering a new google user
            const newUser = new User({
              name,
              email,
              profilePicture: picture,
              password: email + process.env.GOOGLE_PASSWORD,
            });

            newUser
              .save()
              .then(async (user) => {
                const accessToken = await createAccessToken(user);
                const refreshToken = await createRefreshToken(user);
                res.cookie("accessToken", accessToken);
                res.cookie("refreshToken", refreshToken);
                res.status(200).json({
                  success: true,
                  data: {
                    name: user.name,
                    email: user.email,
                    imageUrl: user.profilePicture,
                  },
                });
              })
              .catch((err) => console.log(err));
          }
          //! end of registering a new google user
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
};

const logout = (req, res) => {
  const { accessToken, refreshToken } = req.cookies;

  verifyRefreshToken(refreshToken)
    .then((decoded) => {
      const { userId } = decoded;

      redis_client.del(userId, (err, reply) => {
        if (err)
          return res
            .status(403)
            .json({ success: false, message: "internal server error" });

        res.cookie("accessToken", "", {
          expires: new Date(0),
        });
        res.cookie("refreshToken", "", {
          expires: new Date(0),
        });

        res.status(200).json({ success: true, message: "Logout successfull" });
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

//! verifying if the refresh token is valid and then send a new access token to the client
const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  !refreshToken &&
    res.status(403).json({ success: false, message: "No refresh token found" });

  verifyRefreshToken(refreshToken)
    .then((result) => {
      if (result.userId) {
        User.findById(result.userId)
          .then(async (user) => {
            !user &&
              res
                .status(403)
                .json({ success: false, message: "Invalid refresh token" });

            const userId = user._id;

            redis_client.get(userId.toString(), async (err, result) => {
              err &&
                res.status(500).json({
                  success: false,
                  message: "Internal server error",
                  data: err,
                });

              if (refreshToken === result) {
                const accessToken = await createAccessToken(user);

                res
                  .cookie("accessToken", accessToken, { httpOnly: true })
                  .status(200)
                  .json({
                    success: true,
                    message: "A new access token as been assigned to u",
                  });
              } else {
                res
                  .status(401)
                  .json({ success: false, message: "Invalid refreshToken" });
              }
            });
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
    .catch((err) => {
      if (
        err.name == "JsonWebTokenError" &&
        err.message == "invalid signature"
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot guess our secret, don't be fooled",
        });
      }

      if (err.name == "TokenExpiredError" && err.message == "jwt expired")
        return res.json({
          success: false,
          message: "Access token has expired",
        });
    });
};

//! checking if the client is logged in
const authenticated = async (req, res) => {
  const { accessToken } = req.cookies;
  !accessToken &&
    res.status(401).json({ success: true, message: "No access token found" });

  verifyAccessToken(accessToken)
    .then(async (result) => {
      if (result.userId) {
        try {
          const user = await User.findById(result.userId);

          !user &&
            res.status(403).json({ success: false, message: "user not found" });

          res.status(200).json({
            success: true,
            data: {
              name: user.name,
              email: user.email,
              imageUrl: user.profilePicture,
            },
          });
        } catch (error) {}
      }
    })
    .catch((err) => {
      if (err.name == "TokenExpiredError" && err.message == "jwt expired")
        return res.json({
          success: false,
          message: "Access token has expired",
        });

      if (
        err.name == "JsonWebTokenError" &&
        err.message == "invalid signature"
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot guess our secret, don't be fooled",
        });
      }
    });
};

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  authenticated,
  google_login,
};
