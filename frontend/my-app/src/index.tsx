import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Navbar } from './components/Navbar/Navbar';
import { AuthProvider } from './controller/Authcontroller';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
    <Navbar />
    <App />
    </ AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
