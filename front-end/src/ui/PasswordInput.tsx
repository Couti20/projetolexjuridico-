/**
 * Input de senha com toggle para mostrar/ocultar o conteúdo.
 * Estende InputField para manter consistência visual.
 */

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
}

export function PasswordInput({ id, label, error, className = '', ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError}
          className={[
            'w-full rounded-xl border px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition-all',
            'placeholder:text-slate-400',
            'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
            hasError
              ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
              : 'border-slate-200 bg-white hover:border-slate-300',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
