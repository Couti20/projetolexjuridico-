import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type Props = TooltipProps<ValueType, NameType>;

export function CustomTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 p-2 lg:p-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] shrink-0 backdrop-blur-md">
      <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-white font-bold text-xs lg:text-sm whitespace-nowrap">
        <span className="text-blue-400 text-lg mr-1">{payload[0].value as number}</span>
        prazos fatais
      </p>
    </div>
  );
}
