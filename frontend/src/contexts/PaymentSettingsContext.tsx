import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaymentSettingsPublic } from '../http-routes';

/**
 * Interface for a single UPI Account
 */
export interface UPIAccount {
  id: string;
  upiId: string;
  businessName: string;
}

/**
 * Interface for Payment Settings
 */
export interface PaymentSettings {
  _id: string;
  enableCash: boolean;
  enableUpi: boolean;
  upiAccounts: UPIAccount[];
  defaultUpiId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for Payment Settings Context
 */
interface PaymentSettingsContextType {
  paymentSettings: PaymentSettings | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refreshIfStale: (maxAgeMs?: number) => Promise<void>;
  lastFetchTime: number | null;
}

/**
 * Create Payment Settings Context
 */
const PaymentSettingsContext = createContext<PaymentSettingsContextType | undefined>(undefined);

/**
 * Payment Settings Provider Component
 * 
 * Provides global access to payment settings with smart caching
 * - 5 minute stale time (refetch if older)
 * - 10 minute garbage collection time
 * - Refetch on demand when needed
 * - Handles errors gracefully
 */
interface PaymentSettingsProviderProps {
  children: ReactNode;
}

export function PaymentSettingsProvider({ children }: PaymentSettingsProviderProps) {
  const [lastFetchTime, setLastFetchTime] = React.useState<number | null>(null);

  const {
    data: paymentSettings,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      try {
        const response = await getPaymentSettingsPublic();
        setLastFetchTime(Date.now());
        debugger;
        return response.data.data as PaymentSettings;
      } catch (err) {
        setLastFetchTime(Date.now());
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - consider data stale after 5 min
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collect after 10 min
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  /**
   * Manual refetch function
   * Forces a fresh fetch from the server, ignoring cache
   */
  const handleRefetch = async () => {
    const result = await refetch();
    if (result.data) {
      setLastFetchTime(Date.now());
    }
    return;
  };

  /**
   * Smart refetch: Only refetch if data is stale (older than maxAgeMs)
   * 
   * @param maxAgeMs - Maximum age of data in milliseconds (default: 1 min)
   * If data is older than this, trigger a refetch
   */
  const refreshIfStale = async (maxAgeMs: number = 60 * 1000) => {
    if (!lastFetchTime) {
      // No fetch yet, do one now
      await handleRefetch();
      return;
    }

    const ageMs = Date.now() - lastFetchTime;
    if (ageMs > maxAgeMs) {
      // Data is stale, refetch
      await handleRefetch();
    }
  };

  const value: PaymentSettingsContextType = {
    paymentSettings: paymentSettings || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch: handleRefetch,
    refreshIfStale,
    lastFetchTime,
  };

  return (
    <PaymentSettingsContext.Provider value={value}>
      {children}
    </PaymentSettingsContext.Provider>
  );
}

/**
 * Hook to use Payment Settings Context
 * 
 * Usage:
 * ```tsx
 * const { paymentSettings, isLoading, refreshIfStale } = usePaymentSettings();
 * ```
 */
export function usePaymentSettings(): PaymentSettingsContextType {
  const context = useContext(PaymentSettingsContext);
  if (!context) {
    throw new Error('usePaymentSettings must be used within PaymentSettingsProvider');
  }
  return context;
}

/**
 * Hook to get the default UPI ID
 * 
 * Usage:
 * ```tsx
 * const defaultUpiId = useDefaultUpiId();
 * ```
 */
export function useDefaultUpiId(): string | null {
  const { paymentSettings } = usePaymentSettings();
  return paymentSettings?.defaultUpiId || null;
}

/**
 * Hook to get the default UPI account details
 * 
 * Usage:
 * ```tsx
 * const upiAccount = useDefaultUpiAccount();
 * ```
 */
export function useDefaultUpiAccount(): UPIAccount | null {
  const { paymentSettings } = usePaymentSettings();
  if (!paymentSettings?.defaultUpiId) {
    return null;
  }

  const defaultAccount = paymentSettings.upiAccounts.find(
    (account) => account.id === paymentSettings.defaultUpiId
  );

  return defaultAccount || null;
}

/**
 * Hook to get all UPI accounts
 * 
 * Usage:
 * ```tsx
 * const accounts = useUpiAccounts();
 * ```
 */
export function useUpiAccounts(): UPIAccount[] {
  const { paymentSettings } = usePaymentSettings();
  return paymentSettings?.upiAccounts || [];
}
