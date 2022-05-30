import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

const root = createRoot(document.getElementById('root'));

root.render(<App tab="home" />);
