import { useEffect, useContext } from "react";

import { ContextApp } from "../ContextAPI";


const PageWrapper = (props) => {
  // const dispatch = useDispatch();
  const {  setAppState} = useContext(ContextApp);
  useEffect(() => {
   
    if (props.state) {
      setAppState(props.state)
    }
  }, [props.state, setAppState]);

  return (
    <>{props.children}</>
  );
};

export default PageWrapper;
