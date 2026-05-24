import { type LucideIcon } from 'lucide-react';
import * as S from './styles';

type Icon3DProps = {
  icon: LucideIcon;
  colorType?: 'blue' | 'slate' | 'red';
};

export function Icon3D({ icon: Icon, colorType = 'blue' }: Icon3DProps) {
  return (
    <S.IconWrap>
      <S.Shadow />

      <S.IconCube $colorType={colorType}>
        <S.TopGloss />
        <S.BottomShade />

        <S.IconSlot>
          <Icon size={26} strokeWidth={2.5} />
        </S.IconSlot>
      </S.IconCube>
    </S.IconWrap>
  );
}
