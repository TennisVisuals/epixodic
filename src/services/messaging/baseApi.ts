import { getJwtTokenStorageKey } from '../../config/getJwtTokenStorageKey';
import { browserStorage } from '../../state/browserStorage';
import axios from 'axios';

const JWT_TOKEN_STORAGE_NAME = getJwtTokenStorageKey();
// const baseURL = window.location.host;
const baseURL = 'http://localhost:8383';
const axiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = browserStorage.get(JWT_TOKEN_STORAGE_NAME);
    if (token) {
      config.headers.common.authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.message === 'Network Error') {
      console.log({ message: error.message, intent: 'is-danger' });
    }
    if (error.response) {
      if (error.response?.status === 401) removeAuthorization();
      const message = error.response.data.message || error.response.data.error || error.response.data;
      console.log({ message, intent: 'is-danger' });
    }
  },
);

const addAuthorization = () => {
  const token = browserStorage.get(JWT_TOKEN_STORAGE_NAME);
  if (token) {
    axiosInstance.defaults.headers.common.authorization = `Bearer ${token}`;
  }
};

const removeAuthorization = () => {
  axiosInstance.defaults.headers.common.authorization = undefined;
};

export const baseApi: any = {
  ...axiosInstance,
  removeAuthorization,
  addAuthorization,
};
