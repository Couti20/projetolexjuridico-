import * as S from './styles';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const rawValue = payload[0]?.value;
    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
    return (
      <S.Tooltip>
        <S.Label>{label}</S.Label>
        <S.ValueText>
          <S.Value>{value}</S.Value>
          prazos fatais
        </S.ValueText>
      </S.Tooltip>
    );
  }
  return null;
};
