import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './newGlobalCss.css';
import App from './App';
import { applyDesignSettings } from './PrintPeaksFAinal/user/profile/DesignSettings';
applyDesignSettings();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
