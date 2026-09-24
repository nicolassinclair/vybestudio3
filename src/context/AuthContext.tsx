import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerUser, Order } from '../types';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';

interface AuthContextType {
  // Cliente
  customer: CustomerUser | null;
  customerLoading: boolean;
  customerLogin: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  customerRegister: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  customerLogout: () => void;
  updateCustomerProfile: (updates: { name?: string; phone?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  myOrders: Order[];
  refreshMyOrders: () => Promise<void>;

  // Modal Premium de Autenticação
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot', onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  triggerAuthSuccess: () => void;

  // Administrador (Painel)
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado do Modal de Autenticação
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Estado do Administrador
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return !!apiService.getAdminToken() || storageService.isAdminAuthenticated();
  });

  // Estado do Cliente
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [customerLoading, setCustomerLoading] = useState<boolean>(true);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  const isDemoMode = false; // Sistema com persistência e autenticação de produção ativa

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login', onSuccess?: () => void) => {
    setAuthModalTab(tab);
    if (onSuccess) {
      setAuthSuccessCallback(() => onSuccess);
    } else {
      setAuthSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  }, []);

  const triggerAuthSuccess = useCallback(() => {
    if (authSuccessCallback) {
      try {
        authSuccessCallback();
      } catch (e) {
        console.error('Erro no callback de autenticação:', e);
      }
    }
    closeAuthModal();
  }, [authSuccessCallback, closeAuthModal]);

  // Carrega a sessão do cliente autenticado ao iniciar
  const loadCustomerSession = useCallback(async () => {
    setCustomerLoading(true);
    try {
      const user = await apiService.getMe();
      setCustomer(user);
      if (user) {
        const orders = await apiService.getOrders('customer');
        setMyOrders(orders);
      } else {
        setMyOrders([]);
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão do cliente:', e);
      setCustomer(null);
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomerSession();
  }, [loadCustomerSession]);

  const refreshMyOrders = async () => {
    if (!customer) return;
    try {
      const orders = await apiService.getOrders('customer');
      setMyOrders(orders);
    } catch (e) {
      console.warn('Erro ao atualizar pedidos do cliente:', e);
    }
  };

  // Login de Cliente
  const customerLogin = async (credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiService.login(credentials);
      setCustomer(result.user);
      const orders = await apiService.getOrders('customer');
      setMyOrders(orders);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao realizar login.' };
    }
  };

  // Cadastro de Cliente
  const customerRegister = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiService.register(data);
      setCustomer(result.user);
      setMyOrders([]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar conta.' };
    }
  };

  // Logout de Cliente
  const customerLogout = () => {
    apiService.setToken(null);
    setCustomer(null);
    setMyOrders([]);
  };

  // Atualização de Perfil de Cliente
  const updateCustomerProfile = async (updates: { name?: string; phone?: string; email?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedUser = await apiService.updateProfile(updates);
      setCustomer(updatedUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar dados.' };
    }
  };

  // Login de Administrador
  const login = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    if (!passcode || passcode.trim().length === 0) {
      return { success: false, error: 'Por favor, digite a senha de acesso.' };
    }

    const success = await apiService.adminLogin(passcode);
    if (success) {
      setIsAdminAuthenticated(true);
      storageService.setAdminAuthenticated(true);
      return { success: true };
    }

    return { success: false, error: 'Chave de acesso administrativa inválida.' };
  };

  // Logout de Administrador
  const logout = () => {
    apiService.setAdminToken(null);
    storageService.setAdminAuthenticated(false);
    setIsAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        customerLoading,
        customerLogin,
        customerRegister,
        customerLogout,
        updateCustomerProfile,
        myOrders,
        refreshMyOrders,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        triggerAuthSuccess,
        isAuthenticated: isAdminAuthenticated,
        isDemoMode,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
