import styled from 'styled-components';

export const ToggleButton = styled.button`
  display: inline-grid;
  width: 46px;
  min-height: 42px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink-700);
  transition:
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  &:hover {
    border-color: var(--gold-600);
    color: var(--navy-850);
    transform: translateY(-1px);
  }
`;
