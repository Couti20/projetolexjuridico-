import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import * as S from './styles';

type FaqItemProps = {
  q: string;
  a: string;
};

export function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <S.Item>
      <S.Trigger
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <S.Question>{q}</S.Question>
        <S.Chevron $open={open}>
          <ChevronRight size={20} />
        </S.Chevron>
      </S.Trigger>
      <S.AnswerWrap $open={open}>
        <S.Answer>{a}</S.Answer>
      </S.AnswerWrap>
    </S.Item>
  );
}
