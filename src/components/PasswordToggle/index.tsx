import { ToggleButton } from './styles';

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  const label = visible ? 'Ocultar senha' : 'Mostrar senha';

  return (
    <ToggleButton type="button" aria-label={label} title={label} onClick={onToggle}>
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </ToggleButton>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.1 12s3.6-6.5 9.9-6.5S21.9 12 21.9 12s-3.6 6.5-9.9 6.5S2.1 12 2.1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 3l18 18" />
      <path d="M10.7 5.7A10.7 10.7 0 0 1 12 5.6c6.3 0 9.9 6.4 9.9 6.4a17.4 17.4 0 0 1-3.1 4.1" />
      <path d="M14.1 14.2A3 3 0 0 1 9.8 9.9" />
      <path d="M6.5 6.7A17.3 17.3 0 0 0 2.1 12s3.6 6.5 9.9 6.5c1.8 0 3.4-.5 4.8-1.2" />
    </svg>
  );
}
