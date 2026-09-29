import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccountType, EmployerProfile, EmployerVerificationStatus } from '../types/opportunities';

interface AccountContextType {
  accountType: AccountType;
  employerProfile: EmployerProfile | null;
  hasEmployerAccount: boolean;
  isEmployerVerified: boolean;
  switchAccount: (type: AccountType) => void;
  createEmployerAccount: (profile: Omit<EmployerProfile, 'id' | 'verificationStatus'>) => EmployerProfile;
  updateEmployerProfile: (updates: Partial<EmployerProfile>) => void;
  verifyEmployerAccount: () => void;
  resetEmployerAccount: () => void;
}

const STORAGE_KEYS = {
  ACCOUNT_TYPE: 'atlas_account_type_v1',
  EMPLOYER_PROFILE: 'atlas_employer_profile_v1',
};

export const DEFAULT_EMPLOYER_PROFILE: EmployerProfile = {
  id: 'emp-acme-corp',
  companyName: 'Acme Analytics',
  companyWebsite: 'https://acmeanalytics.io',
  companyEmail: 'talent@acmeanalytics.io',
  industry: 'Analytics & Decision Intelligence',
  companySize: '51–200 employees',
  companyLocation: 'San Francisco, CA / Remote',
  companyDescription:
    'Acme Analytics delivers high-integrity telemetry and predictive analysis pipelines for modern enterprises.',
  companyLogoText: 'AA',
  verificationStatus: 'verified',
  verifiedAt: '2025-01-15T09:00:00Z',
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountType, setAccountType] = useState<AccountType>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE);
      if (stored === 'employer' || stored === 'candidate') {
        return stored;
      }
    } catch {
      // fallback
    }
    return 'candidate';
  });

  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYER_PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    // Return default initialized company profile for instant capability exploration
    return DEFAULT_EMPLOYER_PROFILE;
  });

  // Sync account type to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, accountType);
    } catch {
      // silent
    }
  }, [accountType]);

  // Sync employer profile to localStorage
  useEffect(() => {
    try {
      if (employerProfile) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYER_PROFILE, JSON.stringify(employerProfile));
      } else {
        localStorage.removeItem(STORAGE_KEYS.EMPLOYER_PROFILE);
      }
    } catch {
      // silent
    }
  }, [employerProfile]);

  const switchAccount = useCallback((type: AccountType) => {
    setAccountType(type);
  }, []);

  const createEmployerAccount = useCallback(
    (profileData: Omit<EmployerProfile, 'id' | 'verificationStatus'>) => {
      const newProfile: EmployerProfile = {
        ...profileData,
        id: `emp-${Date.now()}`,
        verificationStatus: 'pending', // begins as pending for verification step
      };
      setEmployerProfile(newProfile);
      setAccountType('employer');
      return newProfile;
    },
    []
  );

  const updateEmployerProfile = useCallback((updates: Partial<EmployerProfile>) => {
    setEmployerProfile((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const verifyEmployerAccount = useCallback(() => {
    setEmployerProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
      };
    });
  }, []);

  const resetEmployerAccount = useCallback(() => {
    setEmployerProfile(DEFAULT_EMPLOYER_PROFILE);
  }, []);

  const hasEmployerAccount = employerProfile !== null;
  const isEmployerVerified = employerProfile?.verificationStatus === 'verified';

  return (
    <AccountContext.Provider
      value={{
        accountType,
        employerProfile,
        hasEmployerAccount,
        isEmployerVerified,
        switchAccount,
        createEmployerAccount,
        updateEmployerProfile,
        verifyEmployerAccount,
        resetEmployerAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
