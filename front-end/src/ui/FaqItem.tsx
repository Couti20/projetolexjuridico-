import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

type FaqItemProps = {
  q: string;
  a: string;
};

export function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-900 text-lg">{q}</span>
        <ChevronRight size={20} className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}
