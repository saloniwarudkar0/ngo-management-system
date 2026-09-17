import { postApiWrapper } from "./token-wrapper-function";
import { API_BASE_URL } from './apiConfig'

const base_url = API_BASE_URL

export const loginUser = async (credentials) => {
    const response = await postApiWrapper(`${base_url}/api/login`, credentials);
    return response;
}
