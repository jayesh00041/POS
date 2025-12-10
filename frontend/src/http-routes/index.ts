import axios from "axios";

const api = axios.create({
  // baseURL: "https://pos-fvk1.onrender.com/api",
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

api.interceptors.response.use(
  (response) => response, // Return successful responses as-is
  async (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      try {
        // Call the logout API
        localStorage.clear();
        
        // Redirect to login page or update app state
        // If you're using React Router, you might want to redirect:
        window.location.href = '/POS/auth/sign-in'; // Or use your routing mechanism
      } catch (logoutError) {
        // Handle any errors from the logout API call
        console.error("Error during automatic logout:", logoutError);
      }
    }
    
    // Return the original error for further processing
    return Promise.reject(error);
  }
);

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

export const getSalesOverview = (startDate, endDate, period, userId) => api.get(`/dashboard/sales-overview?startDate=${startDate}&endDate=${endDate}&period=${period}&userId=${userId}`);
export const getProductInsigts = () => api.get(`/dashboard/product-insights/`);
export const getUserStats = () => api.get(`/dashboard/user-stats/`);

// payment settings Apis
export const getPaymentSettings = () => api.get("/payment-settings/");
export const getPaymentSettingsPublic = () => api.get("/payment-settings/public");
export const updatePaymentSettings = (data) => api.put("/payment-settings/", data);
export const addUpiAccount = (data) => api.post("/payment-settings/upi/add", data);
export const removeUpiAccount = (upiId) => api.delete(`/payment-settings/upi/${upiId}`);
export const setDefaultUpi = (data) => api.put("/payment-settings/upi/default", data);

// Printer Apis (Simplified - Global Default Only)
export const getPrinters = () => api.get("/payment-settings/printer/list");
export const addPrinter = (data) => api.post("/payment-settings/printer/add", data);
export const updatePrinter = (printerId, data) => api.put(`/payment-settings/printer/${printerId}`, data);
export const deletePrinter = (printerId) => api.delete(`/payment-settings/printer/${printerId}`);
export const setDefaultPrinter = (printerId) => api.put(`/payment-settings/printer/${printerId}/set-default`);
export const getDefaultPrinter = () => api.get("/payment-settings/printer/default");