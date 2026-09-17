import React, { createContext, useRef, useState } from 'react'
import { getItem } from './login/storageService'




export const ContextApp = createContext()




const ContextAppProvider = props => {
  const initialRole = getItem('role') || "Public";
  const initialLoggedIn = getItem('loggedIn') === 'true';
  const [appState, setAppState] = useState("")
  const notifisystem = useRef()
  const [keyword, setKeyword] = useState('')
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [role, setRole] = useState(initialRole);
  const [loginModal, setLoginModal] = useState(false);
  const [donateModal, setDonateModal] = useState(false);
  const [volunteerModal, setVolunteerModal] = useState(false);

  const login = () =>{
    setLoggedIn(true);
  }



  return <ContextApp.Provider
    value={{
      appState, setAppState,
      notifisystem,
      keyword, setKeyword,
      currentUser, setCurrentUser,
      loggedIn, login, setLoggedIn,
      loading, setLoading,
      role, setRole, loginModal, setLoginModal,
      donateModal, setDonateModal, volunteerModal, setVolunteerModal
    }}>
    {props.children}
  </ContextApp.Provider>
}
export default ContextAppProvider;
