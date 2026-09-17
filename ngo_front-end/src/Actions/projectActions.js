import { deleteApiWrapper, getApiWrapper, postApiWrapper, putApiWrapper } from "./token-wrapper-function";
import { API_BASE_URL } from './apiConfig'

const base_url = API_BASE_URL

export const createProject = async (data) => {
    console.log("from actions of create project", data)
    const response = await postApiWrapper(`${base_url}/api/projects/create-project`, data);
    return response;
}

export const updateProject = async (id, data) => {
    const response = await putApiWrapper(`${base_url}/api/projects/update-project/${id}`, data);
    return response;
}


export const deleteProject = async (id) => {
    const response = await deleteApiWrapper(`${base_url}/api/projects/delete-project/${id}`);
    return response;
}



export const getProjects = async () => {
    const response = await getApiWrapper(`${base_url}/api/projects/get-projects`);
    return response;
}


export const getProjectById = async (id) => {
    const response = await getApiWrapper(`${base_url}/api/projects/get-project/${id}`);
    return response;
}
