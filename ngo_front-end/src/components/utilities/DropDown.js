import React from 'react';

const DropDown = (props) => {
    const {Actions} = props

    const iconAction =(action)=>{
       console.log("action", action)
        action.action(action.actionName, props.row.original._id, props.row.original)
        props.closeActionBar();
    }
    return (
             <div id="dropdown" className=" z-10   absolute text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow  dark:bg-gray-700">
                    <ul class="py-2" aria-labelledby="dropdownButton">
                        {/* <li>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Edit</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Export Data</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
                        </li> */}
                       { Actions.map((action)=>{
                        return action?.hide?'':(<li>
                            <span onClick={()=>iconAction(action)} className='block px-4 py-2 text-sm  hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>{action.element}</span>
                        </li>)
                       })}
                    </ul>
                </div>
    );
};

export default DropDown;