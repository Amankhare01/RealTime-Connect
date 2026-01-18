import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status !== 401) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
    return Promise.reject(error);
  }
);
