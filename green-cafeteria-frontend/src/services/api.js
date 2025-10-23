import axios from "axios";

// 🔹 API Base URL (Environment variable support সহ)
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

// 🔹 Axios instance তৈরি
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔹 Request Interceptor (token থাকলে auto attach করবে)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
