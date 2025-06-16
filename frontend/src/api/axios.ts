import axios from "axios";

const api = axios.create({
  baseURL: "", // để trống nếu dùng proxy
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
