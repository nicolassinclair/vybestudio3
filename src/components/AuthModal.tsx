import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialTab: propInitialTab,
}) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    customerLogin,
    customerRegister,
    triggerAuthSuccess,
  } = useAuth();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const handleCloseModal = propOnClose || closeAuthModal;
  const currentTab = propInitialTab || authModalTab;

  // Local form states
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(currentTab || 'login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register inputs
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerFieldErrors, setRegisterFieldErrors] = useState<{ [key: string]: string }>({});
  const [registerGeneralError, setRegisterGeneralError] = useState('');

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Token reset state inside recovery tab
  const [showTokenReset, setShowTokenReset] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [tokenResetSuccess, setTokenResetSuccess] = useState('');
  const [tokenResetError, setTokenResetError] = useState('');

  // Loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accessibility & DOM refs
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Sync tab when prop/context changes
  useEffect(() => {
    if (isOpen) {
      setTab(currentTab || 'login');
      setLoginError('');
      setRegisterGeneralError('');
      setRegisterFieldErrors({});
      setForgotError('');
      setForgotMessage('');
      setTokenResetError('');
      setTokenResetSuccess('');
      setShowTokenReset(false);
    }
  }, [isOpen, currentTab]);

  // Accessibility: store trigger element, focus first input, lock body scroll
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        triggerElementRef.current?.focus?.();
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, handleCloseModal]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || !loginPassword) {
      setLoginError('Por favor, informe seu e-mail e senha.');
      return;
    }

    setIsSubmitting(true);
    const result = await customerLogin({ email: cleanEmail, password: loginPassword });
    setIsSubmitting(false);

    if (result.success) {
      triggerAuthSuccess();
    } else {
      setLoginError(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterGeneralError('');
    const errors: { [key: string]: string } = {};

    const cleanName = registerName.trim();
    const cleanEmail = registerEmail.trim().toLowerCase();

    if (!cleanName) {
      errors.name = 'Informe seu nome completo.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errors.email = 'Informe seu endereço de e-mail.';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Informe um e-mail válido.';
    }

    if (registerPassword.length < 6) {
      errors.password = 'A senha deve ter no mínimo 6 caracteres.';
    }

    if (registerPassword !== registerConfirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }

    setRegisterFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const result = await customerRegister({
      name: cleanName,
      email: cleanEmail,
      password: registerPassword,
      confirmPassword: registerConfirmPassword,
    });
    setIsSubmitting(false);

    if (result.success) {
      triggerAuthSuccess();
    } else {
      setRegisterGeneralError(result.error || 'Erro ao realizar cadastro.');
    }
  };

  // Handle Forgot Password submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      setForgotError('Por favor, informe seu endereço de e-mail.');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await apiService.forgotPassword(cleanEmail);
      setForgotMessage(msg || 'Se houver uma conta associada a este e-mail, enviamos as instruções de recuperação.');
    } catch {
      setForgotMessage('Se houver uma conta associada a este e-mail, enviamos as instruções de recuperação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Token Reset submission
  const handleTokenResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenResetError('');
    setTokenResetSuccess('');

    if (!tokenInput.trim() || !newPassword || !confirmNewPassword) {
      setTokenResetError('Preencha todos os campos para redefinir sua senha.');
      return;
    }

    if (newPassword.length < 6) {
      setTokenResetError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setTokenResetError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await apiService.resetPassword({
        token: tokenInput.trim(),
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setTokenResetSuccess(msg || 'Senha redefinida com sucesso!');
      setTimeout(() => {
        setTab('login');
      }, 1500);
    } catch (err: any) {
      setTokenResetError(err.message || 'Código inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Sobreposição semitransparente preta 55% com leve desfoque */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={() => {
          if (!isSubmitting) handleCloseModal();
        }}
        aria-hidden="true"
      />

      {/* Caixa do Modal Compacta e Centralizada */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[460px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto overflow-x-hidden border border-stone-100 transition-all select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Botão de Fechar X */}
        <button
          type="button"
          onClick={() => {
            if (!isSubmitting) handleCloseModal();
          }}
          disabled={isSubmitting}
          aria-label="Fechar janela de autenticação"
          className="absolute right-4 top-4 p-2 text-stone-400 hover:text-black hover:bg-stone-100 rounded-full transition-colors cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo com Logo Oficial VYBE Studio */}
        <div className="flex flex-col items-center text-center pt-1 pb-4">
          <img
            src="https://i.postimg.cc/NFBwg65p/LOGO.png"
            alt="VYBE Studio"
            className="w-32 sm:w-36 h-auto object-contain mb-4 select-none"
            loading="eager"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/logo.png';
            }}
          />

          {tab === 'login' && (
            <>
              <h2 id="auth-modal-title" className="font-display text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Bem-vindo de volta.
              </h2>
              <p className="text-xs sm:text-[13px] text-stone-500 mt-1">
                Entre na sua conta para continuar.
              </p>
            </>
          )}

          {tab === 'register' && (
            <>
              <h2 id="auth-modal-title" className="font-display text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Crie sua conta.
              </h2>
              <p className="text-xs sm:text-[13px] text-stone-500 mt-1">
                Cadastre-se e aproveite sua experiência na VYBE Studio.
              </p>
            </>
          )}

          {tab === 'forgot' && (
            <>
              <h2 id="auth-modal-title" className="font-display text-2xl sm:text-[26px] font-bold text-stone-900 tracking-tight">
                Recuperar senha
              </h2>
              <p className="text-xs sm:text-[13px] text-stone-500 mt-1">
                Informe seu e-mail para receber as instruções de recuperação.
              </p>
            </>
          )}
        </div>

        {/* ================================================================= */}
        {/* ESTADO 1: FORMULÁRIO DE LOGIN                                     */}
        {/* ================================================================= */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                E-mail
              </label>
              <input
                ref={firstInputRef}
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full h-11 px-3.5 text-sm bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-10 text-sm bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                  aria-label={showLoginPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setForgotError('');
                    setForgotMessage('');
                  }}
                  className="text-xs text-stone-500 hover:text-black transition-colors cursor-pointer"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[46px] flex items-center justify-center gap-2 bg-black hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all shadow-xs cursor-pointer mt-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar na minha conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-stone-100 text-center">
              <p className="text-xs sm:text-[13px] text-stone-500">
                Ainda não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setRegisterGeneralError('');
                    setRegisterFieldErrors({});
                  }}
                  className="font-semibold text-black hover:underline underline-offset-4 cursor-pointer"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* ESTADO 2: FORMULÁRIO DE CADASTRO                                  */}
        {/* ================================================================= */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {registerGeneralError && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-snug">{registerGeneralError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Nome completo
              </label>
              <input
                ref={firstInputRef}
                type="text"
                required
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                placeholder="Seu nome completo"
                className={`w-full h-11 px-3.5 text-sm bg-stone-50/60 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors ${
                  registerFieldErrors.name ? 'border-rose-400' : 'border-stone-200'
                }`}
              />
              {registerFieldErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1">{registerFieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className={`w-full h-11 px-3.5 text-sm bg-stone-50/60 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors ${
                  registerFieldErrors.email ? 'border-rose-400' : 'border-stone-200'
                }`}
              />
              {registerFieldErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{registerFieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  required
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className={`w-full h-11 pl-3.5 pr-10 text-sm bg-stone-50/60 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors ${
                    registerFieldErrors.password ? 'border-rose-400' : 'border-stone-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                  aria-label={showRegisterPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {registerFieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1">{registerFieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  type={showRegisterConfirmPassword ? 'text' : 'password'}
                  required
                  value={registerConfirmPassword}
                  onChange={e => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className={`w-full h-11 pl-3.5 pr-10 text-sm bg-stone-50/60 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors ${
                    registerFieldErrors.confirmPassword ? 'border-rose-400' : 'border-stone-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterConfirmPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                  aria-label={showRegisterConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {registerFieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1">{registerFieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[46px] flex items-center justify-center gap-2 bg-black hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all shadow-xs cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <span>Criar minha conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-stone-100 text-center">
              <p className="text-xs sm:text-[13px] text-stone-500">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setLoginError('');
                  }}
                  className="font-semibold text-black hover:underline underline-offset-4 cursor-pointer"
                >
                  Entrar
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* ESTADO 3: RECUPERAÇÃO DE SENHA                                    */}
        {/* ================================================================= */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            {forgotMessage ? (
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">Solicitação enviada</p>
                    <p className="text-stone-600 leading-relaxed">{forgotMessage}</p>
                  </div>
                </div>

                {!showTokenReset ? (
                  <button
                    type="button"
                    onClick={() => setShowTokenReset(true)}
                    className="w-full py-2.5 text-xs text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 font-semibold transition-colors"
                  >
                    Já recebi o código de recuperação
                  </button>
                ) : null}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotError && (
                  <div
                    role="alert"
                    className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-snug">{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    E-mail
                  </label>
                  <input
                    ref={firstInputRef}
                    type="email"
                    required
                    autoComplete="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full h-11 px-3.5 text-sm bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[46px] flex items-center justify-center gap-2 bg-black hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar instruções</span>
                  )}
                </button>
              </form>
            )}

            {/* Sub-formulário para digitação do código recebido */}
            {showTokenReset && (
              <form onSubmit={handleTokenResetSubmit} className="space-y-3 pt-3 border-t border-stone-200">
                <p className="text-xs font-bold text-stone-900">Redefinir nova senha:</p>
                {tokenResetError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{tokenResetError}</p>
                )}
                {tokenResetSuccess && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">{tokenResetSuccess}</p>
                )}

                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  placeholder="Código recebido"
                  className="w-full h-10 px-3 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />

                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nova senha (mínimo 6 caracteres)"
                  className="w-full h-10 px-3 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />

                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className="w-full h-10 px-3 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-black text-white text-xs font-semibold rounded-xl hover:bg-stone-800 disabled:opacity-50"
                >
                  Confirmar nova senha
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setLoginError('');
                }}
                className="text-xs sm:text-[13px] font-semibold text-stone-700 hover:text-black transition-colors cursor-pointer"
              >
                Voltar para o login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
