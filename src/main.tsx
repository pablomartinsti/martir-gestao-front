import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Elemento #app nao encontrado.');
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
