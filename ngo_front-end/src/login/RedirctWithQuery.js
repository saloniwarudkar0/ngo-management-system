import React from 'react'
import { useLocation, Navigate } from "react-router-dom";

function RedirctWithQuery() {
    const location = useLocation();

    // Check if there are any query parameters
    if (location.search) {
      // If there are query parameters, do not redirect
      return null;
    }
  
    // Redirect to home if there are no query parameters
    return <Navigate to="/" replace />;
}

export default RedirctWithQuery