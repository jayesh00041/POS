import axios from "axios";


const api = axios.create({
  baseURL: "https://pos-fvk1.onrender.com/api",
  // baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

export const login = (data: {emailOrPhone: string, password: string}) => api.post("/user/login", data);
export const logout = () => api.post("/user/logout");
export const getUserData = () => api.get("/user/");
export const getUsers = () => api.get("/user/allUsers");
export const blockUnblockUser = (id) => api.put(`/user/blockUnblock/${id}`);
export const addOrUpdateUser = (data) => api.post("/user/register", data);

// category Apis
export const getCategories = () => api.get("/category/");
export const addOrUpdateCategory = (data) => api.post("/category/", data, {
  headers: {
      "Content-Type": "multipart/form-data", // Ensure correct content type
  }
});
export const deleteCategory = (id) => api.delete(`/category/${id}`);

// product Apis
export const getProducts = () => api.get("/product/");
export const addOrUpdateProduct = (data) => api.post("/product/", data, {
  headers: {
      "Content-Type": "multipart/form-data", // Ensure correct content type
  }
});
export const deleteProduct = (id) => api.delete(`/product/${id}`);
export const categoryWiseProducts = () => api.get(`/product/categoryWiseProducts`);

export const createInvoice = (data) => api.post("/invoice/", data);
export const getSalesData = (startDate, endDate) => api.get(`/invoice?startDate=${startDate}&endDate=${endDate}`);