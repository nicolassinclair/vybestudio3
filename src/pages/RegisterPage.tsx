import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';

export const RegisterPage: React.FC = () => {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || (location.state as any)?.from || '/minha-conta';

  // Redireciona de volta para a rota anterior se autenticado
  useEffect(() => {
    if (customer) {
      navigate(from, { replace: true });
    }
  }, [customer, navigate, from]);

  const handleClose = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-stone-50/50 py-12 px-4">
      <AuthModal
        isOpen={true}
        initialTab="register"
        onClose={handleClose}
      />
    </div>
  );
};
