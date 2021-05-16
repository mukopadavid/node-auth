import React, { createContext, useContext, useEffect, useState } from "react";

const PostContext = createContext();
export const usePost = () => useContext(PostContext);

function PostContextProvider({ children }) {
  const [search, setSearch] = useState("tech");
  const [news, setNews] = useState([]);

  //! fetching news when the component mounts and when the search state changes
  useEffect(() => {
    async function getNews() {

      try {
        const res = await fetch(
          `https://gnews.io/api/v4/search?q=${search}&token=${process.env.REACT_APP_GNEWS_API_KEY}`
        );
        const data = await res.json();
        console.log(data);
        setNews(data)
      } catch (error) {
        console.log(error.message);
      }
    }
    getNews();

  }, [search]);

//! end of  fetching news

  return (
    <PostContext.Provider
      value={{
        search,
        setSearch,
        news
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export default PostContextProvider;
