import axios from "axios";
import Blog from "./components/Blogs";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  axios.defaults.withCredentials = true;
  document.title = "News Diggers";
  return (
    <>
      <Navbar />
      <Blog />
      <Footer />
    </>
  );
}

export default App;
