import React, { useRef } from "react";
import Pill from "./Pill";



const TagInputWithPills = (props) =>{
    // const [itemPillInput, setItemPillInput] = useState("");
    const inputRef = useRef(null)

   const { id, pills, handleClosePill, itemPillInput, setItemPillInput, handlePillInput, placeholder, disabled} = props
   
   const onCreatePill= (e)=>{
   
    const val = e.target.value;
  
    if(e.keyCode === 13 & val != ""){
        handlePillInput(val);
        inputRef.current.value="";
    }
   
   }

    return (
        <div class="   shadow-none px-3 border flex justify-start items-center  flex-wrap flex-1 ">
        <ul className="  selection-list border-transparent  flex flex-wrap gap-1">
            {pills.map((pill) => {
                return (<li class="inline-block max-size">
                    <Pill disabled={disabled} value={pill.value} id={pill.id} remove={handleClosePill} />
                </li>)
            })}

            {disabled?"":<li>
                <input id={id}  ref={inputRef} className=' inline-block outline-none flex-1 w-full placeholder:italic' onKeyDown={onCreatePill} placeholder={placeholder} />
            </li>}
        </ul>
    </div>
    )
}

export default TagInputWithPills;