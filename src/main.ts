import './styles/index.css';
import { createMartirApp } from './app/app-controller';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Elemento #app nao encontrado.');
}

createMartirApp(root).init();
