/**
 * Componente de input reutilizável com label acessível e exibição de erro.
 * Aceita todos os atributos nativos de <input> via spread.
 */

import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function InputField({ id, label, error, className = '', ...rest }: InputFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hasError ? `${id}-error` : undefined}
        aria-invalid={hasError}
        className={[
          'w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition-all',
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
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
