import React, { useState } from 'react';
import { MessageSquare, Mail, Instagram, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export const ContactPage: React.FC = () => {
  const settings = storageService.getSettings();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    // Simulation
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 space-y-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block">
          Canais de Atendimento
        </span>
        <h1 className="title-page mt-1">
          Fale Conosco
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mt-2">
          Dúvidas sobre personalização, pedidos corporativos em quantidade ou prazos de entrega? Estamos prontos para atender você.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* WhatsApp Direct Highlight */}
          <div className="bg-stone-900 text-white rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">WhatsApp Oficial</h3>
                <p className="text-xs text-stone-400">Canal mais rápido para atendimento</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Tire dúvidas em tempo real, confirme suas artes e acompanhe o status do seu pedido diretamente com nossa equipe.
            </p>

            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-200 transition-colors shadow-xs"
            >
              <span>Conversar pelo WhatsApp</span>
              <span className="font-mono">({settings.whatsappDisplay})</span>
            </a>
          </div>

          {/* Other Channels */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Outros Canais Cadastrados
            </h3>

            <div className="space-y-3 text-stone-700">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-stone-500 mt-0.5" />
                <div>
                  <span className="text-stone-400 block text-[11px]">E-mail:</span>
                  <a href={`mailto:${settings.email}`} className="font-semibold text-stone-900 hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Instagram className="w-4 h-4 text-stone-500 mt-0.5" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Instagram:</span>
                  <span className="font-semibold text-stone-900">{settings.instagram}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-stone-500 mt-0.5" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Local de Retirada:</span>
                  <span className="text-stone-800">{settings.pickupAddress}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <h2 className="font-display text-xl font-bold text-stone-900 mb-1">
            Envie uma Mensagem
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            Preencha o formulário abaixo para orçamentos especiais ou dúvidas gerais.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Mensagem enviada com sucesso!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Obrigado pelo contato. Responderemos o mais breve possível no e-mail ou WhatsApp informado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="text-xs font-semibold text-black underline pt-2"
              >
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="João Silva"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Seu E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@exemplo.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Assunto</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Orçamento para 50 canecas personalizadas"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Mensagem *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Descreva sua dúvida, quantidade desejada ou detalhes do seu projeto..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Mensagem</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
