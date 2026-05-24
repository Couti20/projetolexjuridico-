/**
 * Input de senha com toggle para mostrar/ocultar o conteúdo.
 * Estende InputField para manter consistência visual.
 */

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import * as S from './styles';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
}

export function PasswordInput({ id, label, error, className = '', ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <S.Field>
      <S.Label htmlFor={id}>{label}</S.Label>
      <S.InputWrap>
        <S.Input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError}
          className={className}
          $hasError={hasError}
          {...rest}
        />
        <S.ToggleButton
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </S.ToggleButton>
      </S.InputWrap>
      {hasError && (
        <S.ErrorText id={`${id}-error`} role="alert">
          {error}
        </S.ErrorText>
      )}
    </S.Field>
  );
}
