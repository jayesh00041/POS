import './assets/css/App.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
console.log('index.tsx.tsx');
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter basename='/POS'>
    <App />
  </BrowserRouter>,
);
