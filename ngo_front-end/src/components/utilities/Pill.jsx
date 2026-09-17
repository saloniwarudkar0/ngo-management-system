import React from 'react';

const Pill = (props) => {
    return (
        <div 
        id={props.id}
        class="inline-flex items-center justify-between space-x-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-md text-sm">
       {props.disabled?'': <svg onClick={()=>{props.remove(props.id)}} className="cursor-pointer h-4 w-4 text-green-900"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>}
        <div class="select-none">
            {props.value}
        </div>
    </div>
    );
};

export default Pill;