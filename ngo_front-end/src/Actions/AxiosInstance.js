import axios from "axios";
import { API_BASE_URL } from './apiConfig'

const tenantId = window.location.hostname;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Add interceptor to attach headers
axiosInstance.interceptors.request.use(
    (config) => {
        config.headers["x-tenant-id"] = tenantId;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
