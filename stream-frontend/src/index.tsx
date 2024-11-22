import { createRoot } from 'react-dom/client';
import React from 'react';

import './style.css';
import App from './app';

window.addEventListener('load', () => {
  const container = document.getElementById('root') as HTMLElement;
  const root = createRoot(container);
  root.render(<App />);
});
