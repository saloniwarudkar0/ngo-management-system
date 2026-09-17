import { type } from "@testing-library/user-event/dist/type";
import { deleteApiWrapper, getApiWrapper, postApiWrapper } from "./token-wrapper-function";

const base_url = 'http://127.0.0.1:4320'




export const getUserFiles = async(id) => {
    // const response = getData();
    const response = await getApiWrapper(`${base_url}/get-user-files/${id}`);
    return response;
    //return Files;
  };


export const generateTempUrl = async(name) =>{
    const response = await fetch(`${base_url}/generate-presigned-url`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',

         },
        body: JSON.stringify({ file_name: name })
      });
    return await response.json();
}


export const addFile = async(file_data) =>{
    const response = await postApiWrapper(`${base_url}/create_file`, file_data);
    return response;
}


export const deleteFile = async(file_id, s3_key) =>{
    const response = await postApiWrapper(`${base_url}/delete-file/${file_id}`, {'key':s3_key});
    return response;
}


export const getDownloadableUrl = async (s3_url) =>{
    const response = await postApiWrapper(`${base_url}/generate-download-url`, {'url':s3_url});
    return response;
}
