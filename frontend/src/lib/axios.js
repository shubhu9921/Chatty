import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/api", // prepend /api automatically
  withCredentials: true,      // send cookies
});

// Optional: Interceptors for errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error:", error);
    return Promise.reject(error);
  }
);
