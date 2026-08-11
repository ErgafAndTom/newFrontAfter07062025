import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './newGlobalCss.css';
import './styles/ppBrand.css';
import './styles/ppModal.css';
import './styles/ppModalOrders.css';
import './styles/ppModalServices.css';
import App from './App';
import { applyDesignSettings } from './PrintPeaksFAinal/user/profile/DesignSettings';
import { getStoredAppTheme, setAppTheme } from './utils/appTheme';
applyDesignSettings();
setAppTheme(getStoredAppTheme());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
