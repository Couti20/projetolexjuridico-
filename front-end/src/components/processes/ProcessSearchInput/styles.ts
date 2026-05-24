import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex: 1;
  max-width: 36rem;
  gap: 0.5rem;
`;

export const InputWrap = styled.div`
  position: relative;
  min-width: 0;
  flex: 1;
`;

export const SearchIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.75rem;
  display: inline-flex;
  color: #94a3b8;
  transform: translateY(-50%);
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.625rem 2.25rem;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.25rem;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #2563eb;
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  display: inline-flex;
  width: 1.5rem;
  height: 1.5rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`;

export const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #2563eb;
  border-radius: 0.75rem;
  background: #2563eb;
  padding: 0.625rem 1rem;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background: #1d4ed8;
  }
`;
