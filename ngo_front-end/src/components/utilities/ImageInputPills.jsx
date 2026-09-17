import React, { useRef } from 'react';
import ImagePill from './ImagePill';

const ImageInputPills = (props) => {
    const { files = [], handleFile, existingImages = [], disabled } = props;
    const inputRef = useRef(null);

    const onInputChange = (e) => {
        handleFile(e)
        if (inputRef.current) {
            inputRef.current.value = '';
        }

    }
    return (
        <div className=' flex gap-2 i flex-col w-full'>
            {/* input image */}

            {disabled ? "" : <div>
                <label for="image-upload" className=" select-none cursor-pointer group">
                    <input id='image-upload' onChange={onInputChange} ref={inputRef} className=' hidden' accept="image/*" type="file" tabIndex="-1" multiple />
                    <div className=" relative w-1/1 min-h-24  overflow-hidden rounded-lg border border-dashed border-gray-600 hover:border-solid">
                        <div className="   text-black hover:text-white bg-slate-200 flex flex-col gap-2 items-center justify-center top-0 w-full left-0 z-10  h-full min-h-24 rounded-sm  hover:bg-black hover:bg-opacity-65">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                            </svg>
                            {/* sign of + */}
                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 text-black hover:text-white fill-black">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg> */}

                            <span className=" font-sans font-light  ">Upload Images</span>
                        </div>
                    </div>
                </label>
            </div>}

            {/* image pill */}
            <div className=' max-w-[350px] overflow-x-auto flex  '>
            <div className=' flex gap-3 mt-3 flex-row '>
                <div className=' flex gap-3 mt-3 flex-row '>
                    {
                        existingImages.map((image) => {

                            return (
                                <div key={image}>
                                    <ImagePill disabled={disabled} primaryIconShow={!image.isPrimary} srcFile={image} onRemove={() => props.imagePillRemove(image, true)} makeImagePillPrimary={() => props.makeImagePillPrimary(image)} />
                                </div>
                            )
                        })
                    }
                </div>
                <div className=' flex gap-3 mt-3 flex-row '>
                    {
                        files.map((file) => {

                            return (
                                <div key={file.urlOfFile}>
                                    <ImagePill primaryIconShow={!file.isPrimary} srcFile={file.urlOfFile} onRemove={() => props.imagePillRemove(file)} makeImagePillPrimary={() => props.makeImagePillPrimary(file)} disabled={disabled} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            </div>

        </div>
    );
};

export default ImageInputPills;