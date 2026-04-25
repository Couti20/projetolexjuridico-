import { FaqItem } from '../ui/FaqItem';

export function FaqSection() {
  return (
    <section className="py-24 section-glass">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Perguntas Frequentes</h2>
        <div className="space-y-6">
          <FaqItem
            q="O Lex lê processos em segredo de justiça?"
            a="Não. Respeitando rigorosamente a LGPD e o sigilo profissional, nossa IA processa apenas andamentos públicos ou informações onde você forneceu o login via cofre de senhas criptografado (AES-256)."
          />
          <FaqItem
            q="Como funciona o resumo com atividades programadas para 'Hoje'?"
            a="Você escolhe o melhor horário, como 07h00 da manhã. Todos os dias nesse horário, listamos no seu WhatsApp um compilado de atividades e prazos monitorados que necessitam da sua atenção específica naquele dia."
          />
          <FaqItem
            q="Preciso instalar algum aplicativo novo?"
            a="Nenhum. Toda a interação e avisos ocorrem via WhatsApp e nosso site que é responsivo em qualquer dispositivo."
          />
        </div>
      </div>
    </section>
  );
}
