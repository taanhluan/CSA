import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://csa-backend-v90k.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;  // ✅ Quan trọng để module hoạt động!
