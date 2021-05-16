import { Avatar, Button, makeStyles } from "@material-ui/core";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";


const useStyles = makeStyles({
  btn: {
    color: "red"
  }
})

function Navbar() {
  const {user, isLoggedIn, setIsLoggedIn } = useAuth();
  const {setSearch} = usePost()
  const [inputValue, setInputValue] = useState("");

  const classes = useStyles()

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputValue) {
      return;
    } else {
      setSearch(inputValue);
    }
  };

  //! logging out the user
  const logoutHandler = async () => {

    try {
     const {data} = await axios.get("/api/auth/logout")
      setIsLoggedIn(data.success)
      window.location.reload()
    } catch (error) {
      console.log(error.message)
    }
  }
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark justify-content-between py-3">
      <ul className="navbar-nav">
        <li className="nav-item">
          <a
            href="!#"
            className="nav-link mr-auto"
            style={{
              color: "#f2f2f2",
            }}
          >
            NEWS DIGGERS
          </a>
        </li>
      </ul>
      {/* empty divs */}
      {isLoggedIn ? (
        <>
          <div></div>
          <div></div>
          <form className="d-flex" onSubmit={handleSubmit}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="btn btn-outline-light" type="submit">
              Search
            </button>
          </form>

          <div>
              <Avatar src={user.imageUrl} />
          </div>
      <div>
        <Button className={classes.btn} onClick={logoutHandler}>Log out</Button>
      </div>
      <div></div>
        </>
      ) : (
        <>
        <h3 style={{ color: "#f2f2f2" }}>We are the best of the best</h3>
        <div></div>
        <div></div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
