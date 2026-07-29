import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --navy-950: #07082b;
    --navy-900: #0a0d3f;
    --navy-850: #101848;
    --navy-800: #172251;
    --blue-650: #2557d6;
    --gold-600: #c9a34a;
    --gold-500: #d8b65d;
    --green-600: #1f9d55;
    --red-600: #c9343f;
    --amber-600: #c98412;
    --ink-900: #111936;
    --ink-700: #2f3a63;
    --ink-500: #68708d;
    --line: #dde3f1;
    --line-strong: #cdd5e8;
    --surface: #ffffff;
    --surface-soft: #f4f6fb;
    --surface-muted: #edf1f8;
    --shadow: 0 18px 40px rgba(13, 24, 58, 0.12);
    --radius: 8px;
    color-scheme: light;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: var(--surface-soft);
    color: var(--ink-900);
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    border: 0;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  pre {
    max-height: 420px;
    overflow: auto;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: #0d1330;
    color: #eaf0ff;
    padding: 14px;
    white-space: pre-wrap;
  }
`;
