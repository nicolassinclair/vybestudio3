import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos para redefinição com token se o usuário já tiver o token
  const [hasTokenMode, setHasTokenMode] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmittedMessage('');

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu endereço de e-mail.');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await apiService.forgotPassword(email.trim());
      setSubmittedMessage(msg);
    } catch {
      setSubmittedMessage('Se houver uma conta associada a este e-mail, enviamos as instruções de recuperação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!tokenInput.trim() || !newPassword || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await apiService.resetPassword({
        token: tokenInput.trim(),
        newPassword,
        confirmPassword,
      });
      setResetSuccessMessage(msg);
    } catch (err: any) {
      setErrorMessage(err.message || 'Código de recuperação inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-stretch bg-white">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: Identidade Visual VYBE Studio                             */}
        {/* ========================================================================= */}
        <div className="bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-hidden select-none">
          <div className="z-10">
            <Link to="/" className="inline-block transition-opacity hover:opacity-85" aria-label="VYBE Studio - Início">
              <img
                src="/images/logo_white.png"
                alt="VYBE Studio"
                className="h-8 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://i.postimg.cc/NFBwg65p/LOGO.png';
                }}
              />
            </Link>
          </div>

          <div className="my-8 sm:my-auto max-w-lg z-10 space-y-3 sm:space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">
              Segurança da Conta
            </span>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight text-white">
              Recuperação de acesso.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md font-normal">
              Redefina sua senha com segurança para continuar acompanhando seus personalizados e pedidos.
            </p>
          </div>

          <div className="z-10 pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-500 hidden sm:flex items-center justify-between">
            <span>VYBE Studio · Autenticação segura</span>
            <span>Suporte disponível</span>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-neutral-800/20 blur-3xl"
          />
        </div>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA: Formulário                                               */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
          <div className="w-full max-w-[420px] space-y-6">
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {hasTokenMode ? 'Redefinir Senha' : 'Esqueceu sua senha?'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                {hasTokenMode
                  ? 'Digite o código recebido e crie sua nova senha.'
                  : 'Informe seu e-mail cadastrado para receber as instruções de recuperação.'}
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-[10px] text-xs text-rose-800 flex items-start gap-2.5 transition-all"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {submittedMessage && !hasTokenMode && (
              <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-[10px] space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                  <span className="leading-relaxed">{submittedMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasTokenMode(true)}
                  className="text-xs font-semibold text-stone-950 underline underline-offset-4 cursor-pointer hover:text-black"
                >
                  Já tenho o código de recuperação
                </button>
              </div>
            )}

            {resetSuccessMessage ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200/80 rounded-[10px] text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-emerald-900">
                  {resetSuccessMessage}
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center h-11 px-5 bg-black text-white text-xs font-semibold rounded-[10px] hover:bg-stone-800 transition-colors"
                >
                  Ir para o Login
                </Link>
              </div>
            ) : hasTokenMode ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Código de Recuperação
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="Insira o código recebido"
                    className="w-full h-12 px-3.5 text-sm bg-white border border-stone-200 rounded-[10px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Nova Senha (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-3.5 text-sm bg-white border border-stone-200 rounded-[10px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-3.5 text-sm bg-white border border-stone-200 rounded-[10px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-black hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-[10px] disabled:opacity-60 transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Atualizando...</span>
                    </>
                  ) : (
                    <>
                      <span>Redefinir Senha</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setHasTokenMode(false)}
                  className="w-full text-center text-xs text-stone-500 hover:text-black transition-colors py-1 cursor-pointer"
                >
                  ← Voltar para solicitação por e-mail
                </button>
              </form>
            ) : (
              !submittedMessage && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Seu E-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full h-12 px-3.5 text-sm bg-white border border-stone-200 rounded-[10px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-black hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-[10px] disabled:opacity-60 transition-all shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Instruções</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setHasTokenMode(true)}
                      className="text-xs text-stone-600 hover:text-black underline underline-offset-4 cursor-pointer"
                    >
                      Já possuo um código de recuperação
                    </button>
                  </div>
                </form>
              )
            )}

            <div className="pt-4 border-t border-stone-100 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-stone-600 hover:text-black transition-colors"
              >
                ← Voltar para o Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
