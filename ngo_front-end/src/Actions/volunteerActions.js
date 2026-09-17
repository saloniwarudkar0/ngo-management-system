import { deleteApiWrapper, getApiWrapper, postApiWrapper, putApiWrapper } from "./token-wrapper-function";
import { API_BASE_URL } from './apiConfig'

const base_url = API_BASE_URL

export const registerVolunteer = async (data) => {
    console.log("from actions of  register volunteer", data)
    const response = await postApiWrapper(`${base_url}/api/volunteers/register-volunteer`, data);
    return response;
}

export const updateVolunteer = async (id, data) => {
    const response = await putApiWrapper(`${base_url}/api/volunteers/update-volunteer/${id}`, data);
    return response;
}


export const authorizeVolunteer = async (id, data={}) => {
    const response = await putApiWrapper(`${base_url}/api/volunteers/authorize/${id}`, data);
    return response;
}


export const deleteVolunteer = async (id) => {
    const response = await deleteApiWrapper(`${base_url}/api/volunteers/delete-volunteer/${id}`);
    return response;
}



export const getVolunteers = async () => {
    const response = await getApiWrapper(`${base_url}/api/volunteers/get-volunteers`);
    return response;
}


export const getVolunteerRequestList = async () => {
    const response = await getApiWrapper(`${base_url}/api/volunteers/get-volunteer-requests`);
    return response;
}
