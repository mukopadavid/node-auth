import axios from "axios";
import GoogleLogin from "react-google-login";
import { v4 as uuid4 } from "uuid";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";

function Blog() {
  const { news } = usePost();
  const { isLoggedIn, setIsLoggedIn, setUser} = useAuth()
  const { articles } = news;
  
  const googleLoginSuccess = (response) => {
    const tokenId = response.tokenId;

    const options = {tokenId}
    axios.post(process.env.REACT_APP_GOOGLE_LOGIN, options)
      .then((res) => {
        const data = res.data
        setIsLoggedIn(data.success)
        setUser({name: data.data.name, email: data.data.email, imageUrl: data.data.imageUrl})

      })
      .catch((err) => console.log(err));

  };

  const googleLoginFailure = (response) => {
    console.log(response)
  };

  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
      }}
    >
      {isLoggedIn ? (
        <>
          <h2
            className="my-3"
            style={{
              color: "orange",
            }}
          >
            Trending now
          </h2>
          <div className="row">
            {articles?.map((article) => (
              <div className="col-lg-4 col-md-6 d-flex" key={uuid4()}>
                <div className="card mb-2">
                  <div className="card-body">
                    <div className="card-title">
                      <h2
                        style={{
                          fontSize: "1.4rem",
                        }}
                      >
                        {article.title}
                      </h2>
                    </div>
                    <div className="card-text">
                      <img
                        src={article.image}
                        alt="no data available"
                        style={{
                          width: "100%",
                          height: "300px",
                          objectFit: "cover"
                        }}
                        className="my-3"
                      />
                      <p>{article.description.slice(0, 200)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            backgroundColor: "#ddd",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
          className="welcome"
        >
          <h1 className="text-center header">Hello, welcome to News Diggers</h1>
          <h3 className="my-3 text-center sub-header">
            To be able to see our news, please login
          </h3>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                className="button"
              >
                Login with google
              </button>
            )}
            buttonText="Login"
            onSuccess={googleLoginSuccess}
            onFailure={googleLoginFailure}
            cookiePolicy={"single_host_origin"}
          />
        </div>
      )}
    </div>
  );
}

export default Blog;
