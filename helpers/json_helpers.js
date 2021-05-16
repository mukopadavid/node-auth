const jwt = require('jsonwebtoken')

module.exports = {

  createAccessToken: function(user){

    const token = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
    return token

  },

  createRefreshToken: function(user){

    const token = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
    return token

  },
  verifyAccessToken: function(token){

      return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

          if(err) return reject(err)
          resolve(decoded)

        })

      })

  },
  verifyRefreshToken: function(token){
    
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {

        if(err) return reject(err)
        resolve(decoded)
        
      })
    })
  
  }

}