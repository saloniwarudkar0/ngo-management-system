import React from 'react';
import PinIcon from '../../Icons/PinIcon';

const ImagePill = (props) => {
   
    return (
       
            <div className=" select-none cursor-pointer ">
                
                <div className=" group relative w-full h-full  overflow-hidden">
                    <span className=" relative align-bottom inline-block w-20 h-20 ">
                        <span className=' overflow-hidden relative '>
                            <img className=' rounded-lg object-fill' src={props.srcFile} />
                        </span>
                    </span>
                  {props.disabled?"":  <div
                        onClick={props.onRemove}
                     className="bg-transparent invisible group-hover:visible  text-white  flex flex-col gap-2 items-center justify-center top-0 w-20 left-0 z-10 absolute h-20 rounded-lg  bg-slate-200 hover:bg-black hover:bg-opacity-65"
                     >
                        {/* cross icon  */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class=" w-10 h-10">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </div>}
                </div>
            </div> 
        
    );
};

export default ImagePill;