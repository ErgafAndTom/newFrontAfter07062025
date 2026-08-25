import React from 'react';
import { Outlet } from "react-router-dom";
import "./Vimogi.css";
import { VmgLabel, VmgDuplexFigure, VmgBleedFigure } from "./Vimogi";

export const Сolortab = () => {
    return (
        <div className="vmg-content">
            <section className="vmg-card">
                <VmgLabel num="01">Формати макетів</VmgLabel>
                <ul className="vmg-list">
                    <li>
                        Макети приймаються у форматах:{' '}
                        <span className="vmg-mono">*.pdf</span> <span className="vmg-mono">*.png</span>{' '}
                        <span className="vmg-mono">*.eps</span> <span className="vmg-mono">*.ai</span>{' '}
                        <span className="vmg-mono">*.psd</span> <span className="vmg-mono">*.tif</span>{' '}
                        <span className="vmg-mono">*.jpg</span> <span className="vmg-mono">*.bmp</span>.
                    </li>
                    <li>
                        Файли, створені у програмах Microsoft Office (Word, Excel, PowerPoint),
                        потрібно зберігати у формат <span className="vmg-mono">*.pdf</span>.
                    </li>
                </ul>
            </section>

            <section className="vmg-card">
                <VmgLabel num="02">Вимоги до верстки</VmgLabel>
                <ul className="vmg-list">
                    <li>
                        Формат верстки повинен перевищувати готовий розмір виробу щонайменше на{' '}
                        <span className="vmg-mono">4 мм</span> (по 2 мм з кожного боку для обрізу).
                        Для точного обрізу необхідно додавати мітки різу.
                    </li>
                    <li>
                        Ключові елементи (логотипи, текст тощо) мають знаходитись на відстані не менше{' '}
                        <span className="vmg-mono">5 мм</span> від краю обрізного формату, щоб уникнути
                        можливих втрат при друці.
                    </li>
                </ul>
            </section>

            <section className="vmg-card vmg-card--wide">
                <VmgLabel num="03">Виліти та розкладка</VmgLabel>
                <VmgBleedFigure />
                <VmgDuplexFigure />
            </section>

            <section className="vmg-card">
                <VmgLabel num="04">Растрові зображення</VmgLabel>
                <ul className="vmg-list">
                    <li>
                        Найкращий формат для якісного друку — <span className="vmg-mono">*.pdf</span> з
                        роздільною здатністю не менше <span className="vmg-mono">300 dpi</span>.
                    </li>
                    <li>
                        Для всіх макетів у CMYK за замовчуванням ігноруються вбудовані кольорові профілі —
                        використовується колірний простір <span className="vmg-mono">ISO Coated FOGRA39L (EFI)</span>.
                    </li>
                    <li>
                        Перетворення кольорів у CMYK виконується за схемою <span className="vmg-mono">relative colormetric</span>{' '}
                        із заміною кольорів поза межами охоплення, а для RGB — за схемою{' '}
                        <span className="vmg-mono">perceptual</span>.
                    </li>
                    <li>
                        Чисті кольори (C, M, Y, K) перетворюються лише за щільністю
                        (<span className="vmg-mono">preserve pure colors</span>).
                    </li>
                </ul>
            </section>

            <section className="vmg-card">
                <VmgLabel num="05">Векторна графіка</VmgLabel>
                <ul className="vmg-list">
                    <li>Усі текстові об’єкти повинні бути переведені у криві.</li>
                    <li>
                        Мінімальна товщина ліній — <span className="vmg-mono">0,1 мм</span> або{' '}
                        <span className="vmg-mono">0,3 pt</span>.
                    </li>
                    <li>Лінії та контури не повинні перевищувати <span className="vmg-mono">700</span> вузлів.</li>
                    <li>
                        Растрові зображення мають бути вбудовані у документ зі 100% масштабом,
                        без зовнішніх зв’язків.
                    </li>
                </ul>

                <div className="vmg-note">
                    <span className="vmg-note__tag">Важливо</span>
                    <span>
                        У PDF-файли не слід вбудовувати кольорові профілі. Якщо це необхідно — вкажіть
                        у заявці на друк, що потрібно використовувати вбудований профіль. Налаштування{' '}
                        <span className="vmg-mono">OVERPRINT</span> передаються у друк відповідно до макета:
                        білий об’єкт з активним Overprint не відображатиметься на відбитку.
                    </span>
                </div>
            </section>

            <section className="vmg-card">
                <VmgLabel num="06">Верстка в Adobe InDesign</VmgLabel>
                <ul className="vmg-list">
                    <li>Якщо шрифти не переведені в криві — вони повинні додаватися окремими файлами.</li>
                    <li>Тексти мають бути у роздільних (unlinked) блоках.</li>
                    <li>Вбудовані об’єкти повинні мати масштаб 100% у вікні, в яке вони вставлені.</li>
                    <li>
                        Шрифти слід надавати у форматах <span className="vmg-mono">TTF</span>,{' '}
                        <span className="vmg-mono">OTF</span>, <span className="vmg-mono">Type1</span> або{' '}
                        <span className="vmg-mono">PS</span>, без використання системних шрифтів.
                    </li>
                </ul>
            </section>

            <section className="vmg-card">
                <VmgLabel num="07">Персоналізація</VmgLabel>
                <ul className="vmg-list">
                    <li>
                        Для персоналізованого друку, окрім основного макета, необхідно надати базу
                        змінних даних у форматі <span className="vmg-mono">*.xls</span> (Microsoft Excel).
                    </li>
                </ul>
            </section>

            <Outlet />
        </div>
    );
};

export default Сolortab;
