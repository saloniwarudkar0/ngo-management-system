import React from 'react';

const TextArea = (props) => {
    const {rounded = 'rounded-lg'} = props
    return (
        <>
            <div class=" w-full relative">
                <textarea 
                type="text" 
                id={props.id} 
                value={props.value}
                required={props.required}
                disabled={props.disabled}
                onChange={(e)=>{props.onChange(e.target.value)}}
                className={`block px-2.5 pb-2.5 pt-2 w-full text-gray-900 bg-transparent ${rounded} border border-blue-600 placeholder-shown:border-gray-500   focus:outline-none focus:ring-0 hover:border-gray-500 focus:border-blue-600 placeholder-transparent  peer`} placeholder="placeholder" />
                <label 
                for={props.id} 
                className="absolute text-blue-600    -translate-y-4   duration-300 transform scale-75 top-2 z-10 origin-[0] px-2 bg-white  peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none">{props.id}</label>
            </div>
        </>
    );
};

export default TextArea;