
import './bootstrap.css';
import './bootstrap.css.map';
import './App.css';
import './Colors.css';
import './StylesOld.css';
import './index.css';
import './global.css';
import {Provider} from "react-redux";
import store from "./stores/store";
import {BrowserRouter as Router} from 'react-router-dom'
import React, {useEffect} from "react";
import AllWindow from "./components/AllWindow";
// В App.tsx або іншому компоненті високого рівня
import { Global, css } from '@emotion/react';

const globalStyles = css`
  @import url('https://use.typekit.net/iro7gjn.css');
`;

function App() {
    useEffect(() => {
        // eslint-disable-next-line no-undef
        document.fonts.ready.then(() => {
            // eslint-disable-next-line no-undef
            if (document.fonts.check('1.3vh "Inter"')) {
                console.log('✅ Шрифт inter завантажено та готовий до використання!');
            } else {
                // eslint-disable-line no-undef
                console.warn('❌ Шрифт inter не завантажено або недоступний.');
                // Спробуємо примусово завантажити шрифти
                // Використовуємо відносні шляхи до шрифтів
                const regularFont = new FontFace('Inter', 'url(./fonts/Inter_18pt-Regular.ttf)', { weight: '400' });
                
                Promise.all([regularFont.load() ])
                    .then(loadedFonts => {
                        loadedFonts.forEach(font => document.fonts.add(font));
                        console.log('✅ Шрифти inter завантажено примусово!');
                    })
                    .catch(err => console.error('❌ Помилка при завантаженні шрифтів:', err));
            }
        });
    }, []);
    return (
        <>
            <Global styles={globalStyles} />
            <div>
                <Provider store={store}>
                    <Router>
                        <AllWindow/>
                    </Router>
                </Provider>
            </div>
        </>
    )
}

export default App;