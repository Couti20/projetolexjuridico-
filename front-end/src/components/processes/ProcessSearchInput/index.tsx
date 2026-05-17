import { Search, X } from 'lucide-react';
import * as S from './styles';

interface ProcessSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  showClear?: boolean;
  onClear?: () => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function ProcessSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  showClear = false,
  onClear,
  className = '',
  inputClassName = '',
  buttonClassName = '',
}: ProcessSearchInputProps) {
  return (
    <S.Form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <S.InputWrap>
        <S.SearchIcon>
          <Search size={15} />
        </S.SearchIcon>
        <S.Input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        {showClear && value.trim() !== '' && onClear && (
          <S.ClearButton
            type="button"
            onClick={onClear}
            aria-label="Limpar busca"
          >
            <X size={13} />
          </S.ClearButton>
        )}
      </S.InputWrap>

      {onSubmit && (
        <S.SubmitButton type="submit" className={buttonClassName}>
          Buscar
        </S.SubmitButton>
      )}
    </S.Form>
  );
}
