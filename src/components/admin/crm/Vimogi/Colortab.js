import React, { useState, useEffect } from 'react';
import bleed from "./public/bleed.png";

import "./Vimogi.css";
import "./Vimogi";
import "./Colorprinthelpsmall";
import {Outlet} from "react-router-dom";
import viz2 from "./public/viz2.png";
import viz3 from "./public/viz3.png";
import viz4 from "./public/viz4.png";


export const Сolortab = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
            <div className="text-container">
                <p><strong>Формати макетів:</strong></p>
                <ul>
                <li>Макети приймаються у форматах: *.pdf, *.png, *.eps, *.ai, *.psd, *.tif, *.jpg, *.bmp,  </li>

                <li>Файли створені у програмах Microsoft Office (Word, Excel, PowerPoint) потрібно зберігати у формат *.pdf,.</li>
                    </ul>
                <div className="viz"
                     style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '17vh'}}>
                    <img className="viz2" alt="" src={viz2} style={{marginRight: '1vw', borderTopLeftRadius: '1vw', borderBottomRightRadius: '1vw'}}/>
                    <img className="viz3" alt="" src={viz3} style={{marginRight: '3vw', borderTopRightRadius: '1vw', borderBottomLeftRadius: '1vw'}}/>
                    <img className="viz2" alt="" src={viz2} style={{marginRight: '1vw', borderTopLeftRadius: '1vw', borderBottomRightRadius: '1vw'}}/>
                    <img className="viz4" alt="" src={viz4} style={{borderTopRightRadius: '1vw', borderBottomLeftRadius: '1vw'}}/>
                </div>
                <p className="print" style={{textAlign: 'center'}}>
                    Макети для двостороннього друку
                </p>
                <p><strong>Вимоги до верстки:</strong></p>
                <ul>
                <li>Формат верстки повинен перевищувати готовий розмір виробу щонайменше на 4 мм (по 2 мм з кожного боку для обрізу). Для забезпечення точного обрізу необхідно додавати мітки різу.</li>

                <li>Ключові елементи (логотипи, текст тощо) повинні знаходитися на відстані не менше ніж 5 мм від краю обрізного формату, щоб уникнути можливих втрат при друці.</li>
                    <div className="bleed"
                         style={{display: 'flex', justifyContent: 'center', margin: "0.5vw", height: '22vh'}}>
                        <img className="bleed" alt="" src={bleed} style={{marginRight: '1vw'}}/>
                    </div>
                    <p className="print" style={{textAlign: 'center', marginBottom: '10px'}}>
                        Виліти — 2 мм якщо аркушева продукція (3 мм якщо багатосторінкова).
                    </p>
                </ul>
                <p><strong>Растрові зображення:</strong></p>
                <ul>
                <li>Найкращий формат для якісного друку – *.pdf з роздільною здатністю не менше 300 dpi.</li>

                <li>Для всіх макетів у CMYK за замовчуванням ігноруються вбудовані кольорові профілі, використовується колірний простір ISO Coated FOGRA39L (EFI).</li>

                <li>Перетворення кольорів у CMYK виконується за схемою relative colormetric із заміною кольорів поза межами охоплення, а для RGB – за схемою perceptual.</li>

                <li>Чисті кольори (C, M, Y, K) перетворюються лише за щільністю (preserve pure colors).</li>
                </ul>
                <p><strong>Векторна графіка:</strong></p>

                <ul>
                    <li>Усі текстові об’єкти повинні бути переведені у криві.</li>
                    <li>Мінімальна товщина ліній – 0.1 мм або 0.3 пункту.</li>
                    <li>Лінії та контури не повинні перевищувати 700 вузлів.</li>
                    <li>Растрові зображення повинні бути вбудовані у документ зі 100% масштабом, без зовнішніх зв’язків.</li>
                    
                </ul>
                <ul>
                <li><strong>ВАЖЛИВО!</strong> У PDF-файли не слід вбудовувати кольорові профілі. Якщо це необхідно, слід вказати у заявці на друк, що потрібно використовувати вбудований профіль.</li>

                <li>Налаштування OVERPRINT передаються у друк відповідно до макета. Будьте уважні! Білий об'єкт з активним Overprint не відображатиметься на відбитку.</li>
            </ul>
                <p><strong>Вимоги до верстки в Adobe InDesign:</strong></p>

                <ul>
                    <li>Якщо шрифти не переведені в криві, вони повинні додаватися окремими файлами.</li>
                    <li>Тексти мають бути у роздільних (unlinked) блоках.</li>
                    <li>Вбудовані об'єкти повинні мати масштаб 100% у вікні, в яке вони вставлені.</li>
                    <li>Шрифти слід надавати у форматах TTF (TrueType), OTF (OpenType), Type1 або PS (PostScript), без використання системних шрифтів.</li>
                </ul>
                <p><strong>Вимоги до макетів з Canva:</strong></p>
            <ul></ul>
                <p><strong>Персоналізація:</strong></p>
                <ul>
                <li>Для персоналізованого друку, окрім основного макета, необхідно надати базу змінних даних у форматі *.xls (Microsoft Excel).</li>
            </ul>

                <Outlet/>
            </div>
        </div>
    );
};

export default Сolortab;