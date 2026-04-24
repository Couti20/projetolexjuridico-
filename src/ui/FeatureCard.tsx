import { motion } from 'motion/react';
import type { LucideIcon } from '../types';
import { Icon3D } from './Icon3D';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="p-8 glass-card transition-all group"
    >
      <Icon3D icon={icon} colorType="blue" />
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{desc}</p>
    </motion.article>
  );
}
