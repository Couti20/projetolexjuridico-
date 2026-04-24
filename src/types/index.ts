import type { LucideIcon } from 'lucide-react';

export type { LucideIcon };

export type ColorType = 'blue' | 'slate' | 'red';

export interface NavItem {
  label: string;
  href: string;
}

export interface PricingFeature {
  text: string;
}

export interface PricingPlan {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  features: PricingFeature[];
  cta: string;
  highlighted?: boolean;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface ProblemItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}
