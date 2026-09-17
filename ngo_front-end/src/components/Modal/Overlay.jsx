import ReactDOM from 'react-dom';
import React, { Fragment } from 'react';



const isBrowser = typeof window !== "undefined"


const Overlay = (props) => {
  return (
    <Fragment>
      {isBrowser ? ReactDOM.createPortal(
        <div className=' absolute pointer-events-auto z-[999999] flex max-w-full max-h-full justify-center items-center ' {...props}>{props.children}</div>,
        document.getElementById('overlay-container')
      ) : ''
      }
    </Fragment>)
};

export default Overlay;