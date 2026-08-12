import styled from 'styled-components';

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(7, 8, 43, 0.58);
  padding: 20px;
`;

export const Dialog = styled.article`
  width: min(980px, 100%);
  max-height: min(92vh, 820px);
  overflow: auto;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
`;

export const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--line);
  padding: 20px;

  h2 {
    margin: 0;
  }
`;

export const Body = styled.div`
  padding: 20px;
`;

export const DetailsStack = styled.div`
  display: grid;
  gap: 16px;
`;

export const NoteCopy = styled.div`
  display: grid;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-soft);
  padding: 16px;

  small {
    color: var(--ink-500);
    font-weight: 900;
  }
`;

export const ErrorMessage = styled.small`
  color: var(--red-600);
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const ResolutionHint = styled.p`
  width: 100%;
  margin: 0;
  border: 1px solid rgba(209, 172, 77, 0.38);
  border-radius: 6px;
  background: #fff8e1;
  color: var(--ink-700);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.45;
  padding: 12px;
`;