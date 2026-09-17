import React from "react";
// import image from "../../assets/images/user-icon.jpg"

const UploadImage = (props) => {
    const {image, handleFile, disabled} = props;
    // const [formData, setFormData] = React.useState();
    return (
        <div className=" p-2 m-auto w-36 h-36  overflow-hidden rounded-full border-2 border-dashed hover:border-solid" role="presentation" tabindex="0">
           
            <label for="image-upload" className=" select-none cursor-pointer group">
            <input id='image-upload' className=' hidden' accept="image/*" type="file" tabindex="-1"  disabled={disabled}  onChange={handleFile}/>
            <div className=" relative w-full h-full rounded-full overflow-hidden">
                <span className=" overflow-hidden relative align-bottom inline-block w-full h-full rounded-full">
                    <span>      
                        <img  src={image} class="shadow-lg rounded-full max-w-full h-auto align-middle border-none" />
                    </span>
                </span>
                {!disabled?(<div 
                className={
                    image=="" ?" bg-black      group-hover:visible  text-white  flex flex-col gap-2 items-center justify-center top-0 w-full left-0 z-10 absolute h-full rounded-full  hover:bg-black hover:bg-opacity-65 ":
                    "bg-transparent invisible group-hover:visible  text-white  flex flex-col gap-2 items-center justify-center top-0 w-full left-0 z-10 absolute h-full rounded-full bg-slate-200 hover:bg-black hover:bg-opacity-65" + ""
                }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    <span className=" font-sans font-light  ">Upload photo</span>
                </div>):("")}
            </div>
            </label>
        </div>
    )
}


export default UploadImage;