import React, {useEffect, useRef} from "react";
import blank_img from '../components/utilities/blank.jpg'
// import assets from "../../../assets";
// import { ContextApp } from "../../../ContextAPI";
// import { removeItem } from "../../../storageService";




const UserDropdown = (props) => {

  // const { signOut } = React.useContext(ContextApp);

  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (btnDropdownRef.current && !btnDropdownRef.current.contains(event.target)) {
      setDropdownPopoverShow(false);
    }
};



// Effect to add click event listener when component mounts
useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    // Clean up event listener when component unmounts
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, []);



  const openDropdownPopover = () => {
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const logoutAction = (e) => {
    e.preventDefault();
    // signOut();
    // removeItem('loggedIn'); 
    window.location.reload();
  }


  return (
    <div
    ref={btnDropdownRef}
    >
      <div 
      className=" pr-5 "
      onClick={(e) => {
        e.preventDefault();
        dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
      }}
      >
        <img
          alt="..."
          className="w-10 rounded-full align-middle border-none shadow-lg"
          src={props.currentUser?.image==''?blank_img:props.currentUser?.image}
        />
      </div>
      {
        dropdownPopoverShow ? (
          <>
            <div className="absolute w-fit z-10  text-base list mt-3 -ml-8  bg-white divide-y divide-gray-100 rounded-lg shadow">
              <ul className="py-2 flex   " aria-labelledby="dropdownButton">
                {/* <li className=" border-r px-1">
                <a href="#">
                  <span className=" text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                    </svg>

                  </span>
                </a>
                </li> */}
                <li className=" px-1 ">
                <a href="#" onClick={props.logout} >
                  <span className=" flex gap-2" >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-red-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                    </svg>
                    <span>logout</span>
                  </span>
                </a>
                </li> 
              </ul>
            </div>
          </>
        )
          :
          ''
      }
    </div>
  )


};

export default UserDropdown;



/*
return (
    <div>
      <span
        className=" peer text-blueGray-500 block"
        href=""
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center sm:hidden flex">
          <span className="w-10 h-10 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full">
            <img
              alt="..."
              className="w-full rounded-full align-middle border-none shadow-lg"
              src="https://randomuser.me/api/portraits/women/76.jpg"
            />
          </span>
        </div>
      </span>
      <div
        className={"peer-hover:block hover:block hidden bg-white text-base z-50 float-right py-2 list-none text-left rounded shadow-lg min-w-48 fixed right-4"}
      >
        <a
          href=""
          className={"text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"}
          onClick={logoutAction}
        >
          Logout
        </a>

        <div className="h-0 my-2 border border-solid border-blueGray-100" />
        <a
          href=""
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={(e) => e.preventDefault()}
        >
          Role : Admin
        </a>
      </div>
    </div>
  );
*/