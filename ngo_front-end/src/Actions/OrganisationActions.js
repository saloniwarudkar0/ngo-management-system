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

export const getAllOrganisations = async() => {
  const response = await getApiWrapper(`${base_url}/get-organisations`);
  console.log('getAllOrganisations', response);
  return response;
};



export const createOrganisation = async (org) => {
  const response = await postApiWrapper(`${base_url}/create-org`, org);
  console.log('createOrganisation', response);
  return response;
}

export const updateOrganisation = async (org, id) => {
  const response = await putApiWrapper(`${base_url}/update-organisation/`+id, org);
  return response;
} 

export const deleteOrganisation = async (id) => {
  const response = await deleteApiWrapper(`${base_url}/delete-organization/${id}`);
  return response;
}

export const getCurrentOrganisationUsers = async(id) => {
  const response = await getApiWrapper(`${base_url}/get-current-organisation-users/${id}`);
  return response;
}


export const getOrganisationDetails = async(id) => {
    const response = await getApiWrapper(`${base_url}/get-organisation-detail/${id}`);
    return response;
  }