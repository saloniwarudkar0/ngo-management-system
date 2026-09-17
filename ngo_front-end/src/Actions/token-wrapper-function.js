
import helpers from './commonAction';

export const getApiWrapper = async (url) => {
  const Token = window.localStorage.getItem('Token');

  return await helpers.httpGet(url, Token);
};

export const postApiWrapper = async (url, data) => {
  const Token = window.localStorage.getItem('Token');

  return await helpers.httpPost(url, data, Token);
};

export const deleteApiWrapper = async (url) => {
  const Token = window.localStorage.getItem('Token');

  return await helpers.httpDelete(url, Token);
};

export const putApiWrapper = async (url, data) => {
  const Token = window.localStorage.getItem('Token');

  return await helpers.httpPut(url, data, Token);
};
