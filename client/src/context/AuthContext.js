import axios from 'axios';
import React, {createContext, useContext ,useEffect,useState} from 'react'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

function AuthContextProvider({children}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", imageUrl: "" });

    //! check if the user is logged in
    useEffect(() => {
      
      async function checkLoginStatus() {
        try {
          const {data} = await axios.get(
            process.env.REACT_APP_CHECK_LOGIN_STATUS
          );
    
          //! checking if the user is logged in and update the state 
          if(data.success){

            const {name, email, imageUrl} = data.data
            
            setIsLoggedIn(data.success);
            setUser({name: name, email: email, imageUrl: imageUrl})

          }
    
          if(!data.success && data.message === "Access token has expired" ){
  
            const {data} = await axios.get(
              process.env.REACT_APP_REFRESH_ACCESS_TOKEN
            );
    
            if(data.success){
              setIsLoggedIn(data.success);
              setUser({name: data.data.name, email: data.data.email, imageUrl: data.data.imageUrl})
            }
    
          }
        } catch (error) {
          setIsLoggedIn(false);
        }
      }
      checkLoginStatus();
    }, []);

  return (
    <>
      <AuthContext.Provider value={{user, setUser, isLoggedIn, setIsLoggedIn}}>
        {children}
      </AuthContext.Provider>
    </>
  )
}

export default AuthContextProvider
