import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { customerLogin, customer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireciona de volta para a rota anterior se autenticado (ex: checkout ou personalizador)
  useEffect(() => {
    if (customer) {
      const from = (location.state as any)?.from?.pathname || (location.state as any)?.from || '/minha-conta';
      navigate(from, { replace: true });
    }
  }, [customer, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    setIsSubmitting(true);
    const result = await customerLogin({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.success) {
      const from = (location.state as any)?.from?.pathname || (location.state as any)?.from || '/minha-conta';
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-stretch bg-white">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: Identidade Visual VYBE Studio (Fundo Preto / Grafite)     */}
        {/* ========================================================================= */}
        <div className="bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-hidden select-none">
          {/* Topo: Logo oficial */}
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

          {/* Centro: Mensagem editorial inspiradora */}
          <div className="my-8 sm:my-auto max-w-lg z-10 space-y-3 sm:space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">
              Conta de Cliente
            </span>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight text-white">
              Sua criatividade começa aqui.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md font-normal">
              Entre na sua conta para acompanhar seus pedidos, salvar suas informações e continuar suas personalizações.
            </p>
          </div>

          {/* Rodapé discreto da coluna */}
          <div className="z-10 pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-500 hidden sm:flex items-center justify-between">
            <span>VYBE Studio · Personalizados exclusivos</span>
            <span>Atendimento via WhatsApp</span>
          </div>

          {/* Detalhe de textura de fundo sutil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-neutral-800/20 blur-3xl"
          />
        </div>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA: Formulário de Autenticação (Fundo Branco)                 */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
          <div className="w-full max-w-[420px] space-y-6">
            {/* Cabeçalho do formulário */}
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Bem-vindo de volta.
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Entre na sua conta para continuar.
              </p>
            </div>

            {/* Mensagem de Erro de validação */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-[10px] text-xs text-rose-800 flex items-start gap-2.5 transition-all"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Formulário de Login */}
            <form onSubmit={handleSubmit} className="space-y-4.5">
              {/* Campo E-mail */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-stone-200 rounded-[10px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Senha
                  </label>
                  <Link
                    to="/esqueci-minha-senha"
                    className="text-xs text-stone-500 hover:text-black transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-3.5 pr-11 text-sm bg-white border border-stone-200 rounded-[10px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão Principal de Login */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 flex items-center justify-center gap-2 bg-black hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold rounded-[10px] disabled:opacity-60 transition-all shadow-xs cursor-pointer"
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
            </form>

            {/* Alternância para Cadastro */}
            <div className="pt-4 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                Ainda não tem uma conta?{' '}
                <Link
                  to="/cadastro"
                  className="font-semibold text-stone-950 hover:underline underline-offset-4 transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
