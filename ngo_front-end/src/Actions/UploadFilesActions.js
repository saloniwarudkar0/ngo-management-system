import { postApiWrapper } from "./token-wrapper-function";
import { API_BASE_URL } from './apiConfig'

const base_url = API_BASE_URL


export const getPresignedUrl = async(file_data) =>{
    const response = await postApiWrapper(`${base_url}/api/generate-presigned-url`, file_data);
    return response;
}
