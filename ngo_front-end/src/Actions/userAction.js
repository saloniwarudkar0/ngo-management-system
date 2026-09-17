import { deleteApiWrapper, getApiWrapper, postApiWrapper, putApiWrapper } from "./token-wrapper-function";
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
/**
 * Retrieves data of users.
 * @returns {Array} An array of user objects.
 */


/**
 * Retrieves all users.
 * @returns {Array} An array of user objects.
 */

const base_url = 'http://34.18.95.25'

export const getAllUsers = async() => {
  const response = await getApiWrapper(`${base_url}/users/get-users`);
  console.log('getAllUsers', response);
  return response;
};



export const createUser = (user) => {
  const response = postApiWrapper(`${base_url}/users/create-user`, user);
  console.log('createUser', response);
  return response;
}

export const updateUser = (user, id) => {
  const response = putApiWrapper(`${base_url}/users/update-user/`+id, user);
  return response;
} 

export const deleteUser = (id, file_name) => {
  const response = deleteApiWrapper(`${base_url}/users/delete-user/${id}/${file_name}`);
  return response;
}

export const getCurrentUser = async() => {
  const response = await getApiWrapper(`${base_url}/get-current-user`);
  return response;
}