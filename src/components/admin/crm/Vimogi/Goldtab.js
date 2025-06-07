import React, { useState, useEffect } from 'react';
import gold1 from "./public/1.png";
import gold2 from "./public/2.png";
import gold3 from "./public/3.png";
import gold4 from "./public/4.png";
import gold5 from "./public/5.png";
import gold6 from "./public/6.png";
import gold7 from "./public/7.png";
import "./Vimogi.css";
import "./Vimogi";
import "./Colorprinthelpsmall";
import {Outlet} from "react-router-dom";



export const Goldtab = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="text-container">
                <p><strong>Формати макетів:</strong></p>
                <ul>
                    <li>Файли приймаються у форматах: PDF, PSD, EPS, AI.</li>
                </ul>
                <p><strong>Вимоги до верстки:</strong></p>
                <ul>
                    <li> Елементи, виділені плашковим кольором "White" (С-100 M-0 Y-0 K-0), будуть віддруковані білим (все, що ще не виділено, колір матеріалу).</li>
                    <li>Порядок друку "Білий – CMYK" або "CMYK – Білий" вказується в коментарях до замовлення! Якщо друк білим використовується як підкладка під CMYK, друк в два проходи білого використовувати не бажано.</li>
                    <li>Друк з білим може здійснюватися в наступних варіантах:
                        <p></p>
                        <p>- тільки білим в 1 прохід</p>
                        <p> - тільки білим в 2 проходи (більш насичений білий, несуміщення (незведення) 1-го і 2-го проходу до 1 мм)</p>
                        <p>- білий + cmyk за два проходи, прохід 1 – білий, прохід 2 – cmyk (суміщення до 1 мм)</p>
                        <p> - cmyk + білий за один прохід (гарне поєднання)</p></li>
                    <li> Adobe Illustrator: елементи під друк білим повинні бути винесені на окремий шар поверх друкованого зображення. Для друку білим в макеті повинен бути створений плашковий колір (С-100 M-0 Y-0 K-0) з використанням імені "White" з обов'язковим використанням атрибута OVERPRINT (накладення заливки).</li>
                    <li> Adobe Photoshop: виділяємо потрібний нам об'єкт, додаємо в вікні "Канали" новий плашковий канал із зазначенням імені "White" (плашковий колір С-100 M-0 Y-0 K-0).</li>
                    <li> Щоб отримати яскравий золотий колір на матеріалі, в макеті під Gold-об'єктами не повинно бути ніяких CMYK-об'єктів або необхідно виключити атрибут «Накладення заливки» (Overprint Fill) у вікні Атрибути при виділеному Gold-елементі. </li>
                </ul>
                <p><strong>Підготовка макета в Adobe Illustrator:</strong></p>
                <ul>
                    <li> 1. Створіть новий зразок кольору (New Swatch).</li>
                    <div className="gold1"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '17vh'}}>
                        <img className="gold1" alt="" src={gold1} style={{marginRight: '1vw'}}/>
                    </div>
                    <li> 2. Назвіть зразок «White» та виберіть «Плашковий колір». (Spot color)</li>
                    <div className="gold2"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '30vh'}}>
                        <img className="gold2" alt="" src={gold2} style={{marginRight: '1vw'}}/>
                    </div>
                    <li> 3. Вибрати колір 100% Cyan (Блакитний плашковий канал буде представляти собою білий тонер).</li>
                    <li> 4. Всі елементи з плашковим кольором White обов'язково повинні знаходитися на передньому плані (або винесені в окремих верхній шар), а також мати атрибут «Накладення заливки» (Overprint Fill) , включити який можна у вікні Атрибути при виділеному елементі.</li>
                    <div className="gold3"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '15vh'}}>
                        <img className="gold3" alt="" src={gold3} style={{marginRight: '1vw'}}/>
                    </div>
                    <li> 5. Збережіть файл у форматі PDF.</li>
                </ul>
                <p><strong>Підготовка макета в Adobe Photoshop:</strong></p>
                <ul>
                    <li> 1. Переконайтеся, що зображення в режимі CMYK (8 біт/канал).</li>
                    <div className="gold6"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '18vh'}}>
                        <img className="gold6" alt="" src={gold6} style={{marginRight: '1vw'}}/>
                    </div>
                    <li> 2. Виділіть необхідні елементи.(Щоб зробити виділення елементів шару потрібно зажати CTRL і натиснути на піктограму шару)</li>
                    <li> 3. Створіть новий плашковий канал (New spot channel) у вікні «Канали» та назвіть канал «White».</li>
                    <div className="gold4"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '22vh'}}>
                        <img className="gold4" alt="" src={gold4} style={{marginRight: '1vw'}}/>
                    </div>
                    <li> 4. Вибрати колір 100% Cyan (Блакитний плашковий канал буде представляти собою білий тонер).</li>
                    <div className="gold5"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '15vh'}}>
                        <img className="gold5" alt="" src={gold5} style={{marginRight: '1vw'}}/>
                    </div>
                    <li> 5. Збережіть файл як копію у форматі Photoshop PDF із збереженням плашечних кольорів.</li>
                    <div className="gold7"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '30vh'}}>
                        <img className="gold7" alt="" src={gold7} style={{marginRight: '1vw'}}/>
                    </div>
                </ul>
                <p><strong>Друк золотим тонером:</strong></p>
                <ul>
                    <li> 1. Підготовка макета для друку золотим кольором аналогічна підготовці для білого кольору. Відмінність в тому, що плашковий (spot) колір необхідно назвати Gold.</li>
                    <li> 2. Рекомендується вибрати колір, який виділяється, наприклад, 100% Yellow (С-0 M-0 Y-100 K-0), щоб легко бачити, де буде використовуватися золотий тонер. ВАЖЛИВО!</li>
                    <li> 3. Щоб отримати яскравий золотий колір на матеріалі в макеті під Gold-об'єктами не повинно бути ніяких CMYK-об'єктів.</li>
                </ul>
                <Outlet/>
            </div>
        </div>
    );
};

export default Goldtab;