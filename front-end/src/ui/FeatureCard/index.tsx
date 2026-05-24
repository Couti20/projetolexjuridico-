import { type LucideIcon } from 'lucide-react';
import { Icon3D } from '../Icon3D';
import * as S from './styles';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <S.Card whileHover={{ y: -5 }}>
      <Icon3D icon={Icon} colorType="blue" />
      <S.Title>{title}</S.Title>
      <S.Description>{desc}</S.Description>
    </S.Card>
  );
}
