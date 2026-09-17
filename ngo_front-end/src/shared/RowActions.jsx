import React, { useState, useRef, useEffect } from 'react';
import DropDown from '../components/utilities/DropDown';
import { classNames } from './Utils';


const RowActions = (props) => {
    const [openAction, setOpenAction] = useState(false);
    const dropdownRef = useRef(null);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpenAction(false);
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

    return (
        <div ref={dropdownRef} class="flex justify-end ">
            {props.Actions.length == 1 ?
                <span onClick={() => {
                   
                    props.Actions[0].action(props.Actions[0].actionName, props.row.original.id)
                }} className='cursor-pointer'>
                    {props.Actions[0].element}  
                </span>
                :
                <button onClick={() => {
                    setOpenAction(!openAction)
                }} id="dropdownButton" data-dropdown-toggle="dropdown" className={ classNames( openAction?"bg-blue-900 text-white hover:bg-blue-900":null, "inline-block bg-blue-100 text-blue-500   hover:bg-blue-200 dark:hover:bg-gray-700  focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-full text-sm p-1.5")} type="button">
                    <span class="sr-only">Open dropdown</span>
                    {/* <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
            </svg> */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>

                </button>
            }
            {/* <!-- Dropdown menu --> */}
            {openAction ? (
                <DropDown Actions={props.Actions} row={props.row} closeActionBar={() => { setOpenAction(false) }} />
            ) : ''
            }
        </div>
    );
};

export default RowActions;