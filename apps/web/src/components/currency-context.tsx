'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  locale: string;
  rateFromINR: number;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: 'Rs', name: 'Indian Rupee', country: 'India', flag: 'IN', locale: 'en-IN', rateFromINR: 1.0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', flag: 'US', locale: 'en-US', rateFromINR: 0.012 },
  { code: 'GBP', symbol: 'GBP', name: 'British Pound', country: 'United Kingdom', flag: 'GB', locale: 'en-GB', rateFromINR: 0.0094 },
  { code: 'EUR', symbol: 'EUR', name: 'Euro', country: 'Eurozone', flag: 'EU', locale: 'de-DE', rateFromINR: 0.011 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', flag: 'AE', locale: 'en-AE', rateFromINR: 0.044 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', flag: 'SA', locale: 'ar-SA', rateFromINR: 0.045 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada', flag: 'CA', locale: 'en-CA', rateFromINR: 0.016 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', country: 'Australia', flag: 'AU', locale: 'en-AU', rateFromINR: 0.018 },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', country: 'Singapore', flag: 'SG', locale: 'en-SG', rateFromINR: 0.016 },
  { code: 'JPY', symbol: 'JPY', name: 'Japanese Yen', country: 'Japan', flag: 'JP', locale: 'ja-JP', rateFromINR: 1.85 },
];

interface CurrencyContextType {
  currentCurrency: CurrencyConfig;
  setCurrencyByCode: (code: string) => void;
  formatCurrency: (amountInINR: number) => string;
  convertFromINR: (amountInINR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);

  useEffect(() => {
    const savedCode = getLocalStorage<string>('yh_preferred_currency', 'INR');
    const matched = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === savedCode.toUpperCase());
    if (matched) {
      setCurrency(matched);
    }
  }, []);

  const setCurrencyByCode = useCallback((code: string) => {
    const matched = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (matched) {
      setCurrency(matched);
      setLocalStorage('yh_preferred_currency', matched.code);
    }
  }, []);

  const convertFromINR = useCallback((amountInINR: number): number => {
    if (isNaN(amountInINR) || amountInINR === null || amountInINR === undefined) return 0;
    return amountInINR * currency.rateFromINR;
  }, [currency]);

  const formatCurrency = useCallback((amountInINR: number): string => {
    if (isNaN(amountInINR) || amountInINR === null || amountInINR === undefined) {
      return `${currency.symbol} 0`;
    }
    const converted = amountInINR * currency.rateFromINR;
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: currency.code === 'JPY' ? 0 : 0,
      }).format(converted);
    } catch {
      return `${currency.symbol} ${Math.round(converted).toLocaleString()}`;
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currentCurrency: currency, setCurrencyByCode, formatCurrency, convertFromINR }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    const defaultCurrency = SUPPORTED_CURRENCIES[0];
    return {
      currentCurrency: defaultCurrency,
      setCurrencyByCode: () => {},
      convertFromINR: (amt: number) => amt,
      formatCurrency: (amt: number) => {
        try {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(amt || 0);
        } catch {
          return `Rs ${amt || 0}`;
        }
      }
    };
  }
  return context;
};
