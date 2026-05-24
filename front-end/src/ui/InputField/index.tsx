/**
 * Componente de input reutilizável com label acessível e exibição de erro.
 * Aceita todos os atributos nativos de <input> via spread.
 */

import type { InputHTMLAttributes } from 'react';
import * as S from './styles';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function InputField({ id, label, error, className = '', ...rest }: InputFieldProps) {
  const hasError = Boolean(error);

  return (
    <S.Field>
      <S.Label htmlFor={id}>{label}</S.Label>
      <S.Input
        id={id}
        aria-describedby={hasError ? `${id}-error` : undefined}
        aria-invalid={hasError}
        className={className}
        $hasError={hasError}
        {...rest}
      />
      {hasError && (
        <S.ErrorText id={`${id}-error`} role="alert">
          {error}
        </S.ErrorText>
      )}
    </S.Field>
  );
}
