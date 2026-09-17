import React, { useContext, useEffect } from 'react'
// import {useSelector} from "react-redux"
import {Navigate, useLocation} from "react-router-dom"
import { ContextApp } from '../ContextAPI';

const ProtectedRoute = ({component:Component}) => {
    // const user = useSelector((state) => state.user);
    const {loggedIn} = useContext(ContextApp);
    console.log("rendered")
    useEffect(() => {
       
        console.log(loggedIn)
    }, [loggedIn])


    let location = useLocation();

    if(!loggedIn) {
        return <Navigate to="/login" state={{ from: location}} replace />
    }
 return <Component />

};

export default ProtectedRoute;