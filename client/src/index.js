import ReactDom from "react-dom";
import App from "./App";
import "./index.css";
import PostContextProvider from "./context/PostContext";
import AuthContextProvider from "./context/AuthContext";

ReactDom.render(
  <AuthContextProvider>
    <PostContextProvider>
      <App />
    </PostContextProvider>
  </AuthContextProvider>
  ,
  document.getElementById("root")
);
