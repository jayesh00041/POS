import React, { createContext, useContext, useEffect, useState } from 'react';

// Create a context for privileges
type PrivilegeContextType = {
  isUserAuthorised: (requiredPrivilege: string, content: React.ReactNode) => React.ReactNode;
  privileges: string[];
};

const PrivilegeContext = createContext<PrivilegeContextType | undefined>(undefined);

// Privilege Provider component
export const PrivilegeProvider = ({ children }) => {
  const [privileges, setPrivileges] = useState([]);
  const user: any = JSON.parse(localStorage.getItem('user'));

  // Fetch privileges from the server (you can call this in useEffect or when the user logs in)
  useEffect(() => {
    setPrivileges((user.role === "admin") ? [
        "SALES_READ", "SALES_WRITE",
        "PRODUCTS_READ", "PRODUCTS_WRITE",
        "USERS_READ", "USERS_WRITE",
        "CATEGORIES_READ", "CATEGORIES_WRITE",
        "REFUNDS_READ", "REFUNDS_WRITE",
    ] : (user.role === "biller") ? [
        "SALES_READ", "SALES_WRITE",
        "PRODUCTS_READ", 
        "CATEGORIES_READ", 
    ] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to check if the user is authorized for a specific privilege
  const isUserAuthorised = (requiredPrivilege, content) => {
    return (requiredPrivilege=== "" || privileges.includes(requiredPrivilege)) ? content : null; // Returns true if the privilege exists and is true
  };

  return (
    <PrivilegeContext.Provider value={{ privileges, isUserAuthorised }}>
      {children}
    </PrivilegeContext.Provider>
  );
};

// Custom hook to use the privilege context
export const usePrivilege = () => {
  return useContext(PrivilegeContext);
};

export class Privilege {
  static SALES_READ = "SALES_READ";
  static SALES_WRITE = "SALES_WRITE";
  static PRODUCTS_READ = "PRODUCTS_READ";
  static PRODUCTS_WRITE = "PRODUCTS_WRITE";
  static USERS_READ = "USERS_READ";
  static USERS_WRITE = "USERS_WRITE";
  static CATEGORIES_READ = "CATEGORIES_READ";
  static CATEGORIES_WRITE = "CATEGORIES_WRITE";
  static REFUNDS_READ = "REFUNDS_READ";
  static REFUNDS_WRITE = "REFUNDS_WRITE";
}