import { Search, X } from 'lucide-react';

interface ProcessSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  showClear?: boolean;
  onClear?: () => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function ProcessSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  showClear = false,
  onClear,
  className = '',
  inputClassName = '',
  buttonClassName = '',
}: ProcessSearchInputProps) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="relative flex-1 min-w-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={[
            'w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
            inputClassName,
          ].join(' ')}
        />
        {showClear && value.trim() !== '' && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Limpar busca"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {onSubmit && (
        <button
          type="submit"
          className={[
            'inline-flex items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors',
            buttonClassName,
          ].join(' ')}
        >
          Buscar
        </button>
      )}
    </form>
  );
}