import React from 'react'

const Input = (props) => {
    const { width='w-full', rounded = 'rounded-lg'} = props
   
    return (
        <>
            <div className={`relative ${width}`}>
                <input 
                type={props?.type?props?.type:"text"}
                required={props.required} 
                disabled = {props.disabled}
                id={props.id} 
                value={props.value}
                onChange={(e)=>{console.log("type: ",props?.type?props?.type:"text", e.target.value); props.onChange(e.target.value)}}
                className={`block px-2.5 pb-2.5 pt-2 ${width} text-gray-900 bg-transparent ${rounded}  border border-blue-600 placeholder-shown:border-gray-500  dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 hover:border-gray-500 focus:border-blue-600 placeholder-transparent  peer`} placeholder="placeholder" />
                <label 
                htmlFor={props.id}
                className="absolute text-blue-600 -translate-y-4   duration-300 transform scale-75 top-2 z-10 origin-[0] px-2 bg-white   peer-focus:px-2 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none"
                >
                {props.id}
                </label>
            </div>
        </>

    )
}
export default Input;