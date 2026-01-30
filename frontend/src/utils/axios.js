import axios from 'axios';
import { getApiUrl } from './config.js';

const axiosInstance = axios.create({
    baseURL: getApiUrl(),
    timeout: 30000, // Increased timeout for production
    withCredentials: true
})


// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    console.error("Bad Request:", data);
                    break;
                case 401:
                    // 401 is expected when checking auth status if not logged in
                    // console.warn("Unauthorized:", data); 
                    break;
                case 403:
                    console.error("Forbidden:", data);
                    break;
                case 404:
                    console.error("Not Found:", data);
                    break;
                case 500:
                    console.error("Server Error:", data);
                    break;
                default:
                    console.error(`Error (${status}):`, data);
            }
        } else if (error.request) {
            console.error("Network Error: No response received", error.request);
        } else {
            console.error("Axios Config Error:", error.message);
        }

        return Promise.reject({
            message: error.response?.data?.message || error.message || "Unknown error occurred",
            status: error.response?.status || null,
            data: error.response?.data || null,
        });
    }
);

export default axiosInstance;
