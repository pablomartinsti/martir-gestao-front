import styled from 'styled-components';

export const AuthShell = styled.section`
  display: grid;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  grid-template-columns: minmax(320px, 34%) minmax(0, 1fr);
  background: var(--surface-soft);
  overflow: hidden;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
`;

export const AuthBrand = styled.aside`
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  justify-content: space-between;
  background: var(--navy-950);
  color: #ffffff;
  padding: 42px 38px;

  img {
    width: 240px;
    max-width: 100%;
  }

  span {
    color: var(--gold-500);
    font-size: 0.76rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 360px;
    margin: auto 0 8px;
    font-size: clamp(2.4rem, 5vw, 4.6rem);
    line-height: 0.95;
  }

  p {
    max-width: 390px;
    color: rgba(255, 255, 255, 0.72);
  }

  @media (max-width: 940px) {
    height: auto;
    min-height: auto;
    gap: 30px;
  }
`;

export const AuthPanel = styled.div<{ $centered: boolean }>`
  display: grid;
  min-height: 0;
  align-items: ${({ $centered }) => ($centered ? 'center' : 'start')};
  justify-items: center;
  overflow-y: auto;
  padding: 28px;

  @media (max-width: 940px) {
    overflow: visible;
  }
`;

export const AuthCard = styled.article<{ $wide: boolean }>`
  width: min(${({ $wide }) => ($wide ? '920px' : '440px')}, 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 24px;
`;

export const AuthHead = styled.header`
  margin-bottom: 16px;

  span {
    color: var(--gold-600);
    font-size: 0.74rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin: 4px 0 0;
  }
`;

export const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  border-radius: var(--radius);
  background: var(--surface-muted);
  padding: 4px;
  margin-bottom: 18px;

  button {
    min-height: 40px;
    border-radius: 6px;
    background: transparent;
    color: var(--ink-700);
    font-weight: 900;
  }

  button.active {
    background: #ffffff;
    color: var(--ink-900);
    box-shadow: 0 4px 16px rgba(13, 24, 58, 0.08);
  }
`;

export const AuthForm = styled.form`
  display: grid;
  gap: 14px;
`;

export const PasswordRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`;

export const GoogleBox = styled.div`
  display: grid;
  justify-content: center;
  gap: 6px;
  color: var(--ink-500);
  font-size: 0.78rem;
`;

export const Divider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  color: var(--ink-500);
  font-size: 0.76rem;

  &::before,
  &::after {
    content: '';
    height: 1px;
    background: var(--line);
  }
`;
