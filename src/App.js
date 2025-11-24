
import './bootstrap.css';
import './bootstrap.css.map';
import './App.css';
import './Colors.css';
import './StylesOld.css';
import './index.css';
import './global.css';
import {Provider} from "react-redux";
import {store} from "./stores/store";
import {BrowserRouter as Router} from 'react-router-dom'
import React, {useEffect} from "react";
import AllWindow from "./components/AllWindow";
// В App.tsx або іншому компоненті високого рівня
import { Global, css } from '@emotion/react';
import TelegramProvider from "./telegram";

import { initWebSocket } from "./ws";
import TelegramDrawer from "./components/Telegram/TelegramDrawer";
import useTelegramNotifications from "./components/Telegram/useTelegramNotifications";

const globalStyles = css`
  @import url('https://use.typekit.net/iro7gjn.css');
`;

function App() {


  useEffect(() => {
        document.fonts.ready.then(() => {
            if (document.fonts.check) {
                console.log('✅ Шрифт inter завантажено та готовий до використання!');
            } else {
                console.warn('❌ Шрифт inter не завантажено або недоступний.');
                // const regularFont = new FontFace('Playpen_Sans', 'url(./fonts/Inter_18pt-Regular.ttf)', { weight: '400' });
                //
                // Promise.all([regularFont.load() ])
                //     .then(loadedFonts => {
                //         loadedFonts.forEach(font => document.fonts.add(font));
                //         // console.log('✅ Шрифти inter завантажено примусово!');
                //     })
                //     .catch(err => console.error('❌ Помилка при завантаженні шрифтів:', err));
            }
        });
    }, []);
  // useEffect(() => {
  //   initWebSocket();
  // }, []);

  return (
    <Provider store={store}>          {/* ← ЭТО ДОЛЖНО БЫТЬ САМОЕ ВНЕШНЕЕ */}
      <TelegramProvider>
        <Router>
          <AllWindow />
        </Router>

        {/* ВАЖЛИВО: Drawer стоїть ТУТ !!! */}
        {/*<TelegramDrawer />*/}
      </TelegramProvider>

    </Provider>
  );
}

export default App;
