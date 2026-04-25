import type { LucideIcon } from '../types';
import type { ColorType } from '../types';

interface Icon3DProps {
  icon: LucideIcon;
  colorType?: ColorType;
}

const COLOR_CLASSES: Record<ColorType, string> = {
  blue:  'from-blue-400 via-blue-500 to-blue-700 shadow-[inset_0px_-3px_8px_rgba(0,0,0,0.3),inset_0px_3px_8px_rgba(255,255,255,0.4),0_6px_15px_-3px_rgba(37,99,235,0.4)]',
  slate: 'from-slate-600 via-slate-700 to-slate-900 shadow-[inset_0px_-3px_8px_rgba(0,0,0,0.4),inset_0px_3px_8px_rgba(255,255,255,0.2),0_6px_15px_-3px_rgba(15,23,42,0.4)]',
  red:   'from-rose-400 via-rose-500 to-rose-700 shadow-[inset_0px_-3px_8px_rgba(0,0,0,0.3),inset_0px_3px_8px_rgba(255,255,255,0.4),0_6px_15px_-3px_rgba(225,29,72,0.4)]',
};

export function Icon3D({ icon: Icon, colorType = 'blue' }: Icon3DProps) {
  return (
    <div className="relative w-14 h-14 group perspective-1000 mb-6">
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-900/40 blur-[4px] rounded-full transition-all duration-300 group-hover:scale-75 group-hover:opacity-50" />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          COLOR_CLASSES[colorType]
        } rounded-2xl transition-transform duration-300 group-hover:-translate-y-1.5 flex items-center justify-center overflow-hidden border border-white/20`}
      >
        <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-2xl pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent rounded-b-2xl pointer-events-none" />
        <Icon
          size={26}
          strokeWidth={2.5}
          className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 transform transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
