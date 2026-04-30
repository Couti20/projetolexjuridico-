import { useMemo, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  LifeBuoy,
  Mail,
  MessageCircle,
  Search,
  Send,
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';

type TicketStatus = 'idle' | 'sending' | 'sent';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-alerta',
    question: 'Como garantir que eu receba os alertas no WhatsApp?',
    answer:
      'Confirme seu numero na tela de perfil e mantenha o WhatsApp ativo. Em casos de troca de numero, atualize o cadastro imediatamente.',
  },
  {
    id: 'faq-oab',
    question: 'Posso alterar minha OAB principal depois do onboarding?',
    answer:
      'Sim. Acesse Configuracoes > Meu perfil, altere a OAB principal e salve. A nova configuracao passa a valer no proximo ciclo de sincronizacao.',
  },
  {
    id: 'faq-fatura',
    question: 'Onde encontro minhas faturas e recibos?',
    answer:
      'Em Configuracoes > Plano e faturamento voce encontra o historico de cobrancas, status e download de comprovantes disponiveis.',
  },
  {
    id: 'faq-seguranca',
    question: 'Como reforcar a seguranca da minha conta?',
    answer:
      'Use senha forte, ative verificacao em duas etapas e encerre sessoes nao reconhecidas na tela de Seguranca.',
  },
];

export function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('idle');

  const filteredFaq = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(normalized) ||
        item.answer.toLowerCase().includes(normalized),
    );
  }, [search]);

  async function handleSubmitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setTicketStatus('sending');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setTicketStatus('sent');
    setSubject('');
    setMessage('');

    window.setTimeout(() => {
      setTicketStatus('idle');
    }, 2500);
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Central de ajuda</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Encontre respostas rapidas e fale com nosso time quando precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <LifeBuoy size={17} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">Canais de suporte</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="mailto:suporte@lex.com.br?subject=Ajuda%20Lex"
                className="rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-300 transition-colors"
              >
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Mail size={15} className="text-slate-500" />
                  E-mail
                </p>
                <p className="text-xs text-slate-500 mt-1">suporte@lex.com.br</p>
              </a>

              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-300 transition-colors"
              >
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MessageCircle size={15} className="text-slate-500" />
                  WhatsApp
                </p>
                <p className="text-xs text-slate-500 mt-1">Atendimento comercial e operacional</p>
              </a>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
              Tempo medio de resposta: <strong>ate 1 dia util</strong>.
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Abrir chamado</h2>
            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="ticketSubject" className="text-sm font-medium text-slate-700">
                  Assunto
                </label>
                <input
                  id="ticketSubject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Ex: duvida sobre notificacao"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ticketMessage" className="text-sm font-medium text-slate-700">
                  Mensagem
                </label>
                <textarea
                  id="ticketMessage"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Descreva o problema com o maximo de contexto."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!subject.trim() || !message.trim() || ticketStatus === 'sending'}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ticketStatus === 'sending' ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Enviar chamado
                  </>
                )}
              </button>

              {ticketStatus === 'sent' && (
                <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 size={14} />
                  Chamado enviado. Retorno por e-mail em breve.
                </p>
              )}
            </form>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Perguntas frequentes</h2>
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar na ajuda..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {filteredFaq.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum resultado para sua busca.</p>
          ) : (
            <div className="space-y-2">
              {filteredFaq.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <div key={item.id} className="rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setOpenFaqId((prev) => (prev === item.id ? '' : item.id))}
                      aria-expanded={isOpen}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left"
                    >
                      <span className="flex-1 text-sm font-medium text-slate-800">{item.question}</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
