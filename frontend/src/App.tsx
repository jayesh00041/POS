import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import {} from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState } from 'react';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';
import { CookiesProvider } from 'react-cookie';
import { PrivilegeProvider } from './contexts/PrivilegeContext';
// Chakra imports

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
      },
    },
  });
  return (
    <ChakraProvider theme={currentTheme}>
      <UserProvider>
        <SnackbarProvider autoHideDuration={3000}>
          <QueryClientProvider client={queryClient}>
            <CartProvider>
              <CookiesProvider>
                <Routes>
                  <Route path="auth/*" element={<AuthLayout />} />

                  <Route
                    path="admin/*"
                    element={
                      <PrivilegeProvider>
                        <ProtectedRoute>
                          <AdminLayout
                            theme={currentTheme}
                            setTheme={setCurrentTheme}
                          />
                        </ProtectedRoute>
                      </PrivilegeProvider>
                    }
                  />
                  <Route
                    path="/"
                    element={<Navigate to="/auth/sign-in" replace />}
                  />
                </Routes>
              </CookiesProvider>
            </CartProvider>
          </QueryClientProvider>
        </SnackbarProvider>
      </UserProvider>
    </ChakraProvider>
  );
}
