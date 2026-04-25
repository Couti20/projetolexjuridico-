import { useState, useId } from 'react';
import { ChevronRight } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
}

export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const answerId = useId();

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={answerId}
        className="w-full text-left px-6 py-5 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-2xl"
      >
        <span className="font-semibold text-slate-900 text-lg pr-4">{question}</span>
        <ChevronRight
          size={20}
          aria-hidden="true"
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-90' : ''
          }`}
        />
      </button>

      <div
        id={answerId}
        role="region"
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
