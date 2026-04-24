import type { TooltipProps } from 'recharts';

export const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const rawValue = payload[0]?.value;
    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 lg:p-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] shrink-0 backdrop-blur-md">
        <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-white font-bold text-xs lg:text-sm whitespace-nowrap">
          <span className="text-blue-400 text-lg mr-1">{value}</span>
          prazos fatais
        </p>
      </div>
    );
  }
  return null;
};
