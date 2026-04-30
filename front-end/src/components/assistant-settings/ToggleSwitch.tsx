interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function ToggleSwitch({ checked, onChange, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      onClick={onChange}
      className={[
        'relative h-6 w-11 rounded-full border transition-colors shrink-0',
        checked ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}
