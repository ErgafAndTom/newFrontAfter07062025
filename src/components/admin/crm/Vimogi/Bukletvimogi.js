import React, { useState, useEffect } from 'react';
import image9 from "./public/image-9@2x.png";
import image10 from "./public/image-10@2x.png";
import image11 from "./public/image-11@2x.png";
import image12 from "./public/image-12@2x.png";
import image13 from "./public/image-13@2x.png";
import image14 from "./public/image-14@2x.png";
import image15 from "./public/image-15@2x.png";
import image16 from "./public/image-16@2x.png";
import image17 from "./public/image-17@2x.png";
import "./Vimogi.css";
import "./Vimogi";
import "./Layouthelpsmall";
import {Outlet} from "react-router-dom";


export const Bukletvimogi = () => {
    return (
        <div className="d-flex justify-content-center custom-button-row">
    <div className="text-container">
        <b className="tverd-text19">Макетування буклетів</b>
<b className="tverd-text20">Скріплення на скобу</b>
<b className="tverd-text21">Зшивання на пружину</b>
<b className="tverd-text22">Свердління</b>

    <li className="print">
        При фальцюванні буклета «гармошкою» всі частини повинні бути одного
        розміру.
    </li>
    <li className="print">
        Наприклад, у буклеті 297х210 мм у розвороті, що фальцюється двома
        фальцями за принципом «гармошки», всі три частини рівні 99 мм.
    </li>

<div className="tverd-text24">
    <li className="print">
        Макет має бути у форматі *.pdf. Неприпустимо надавати файли
        розворотами, приймаються лише посторінкові.
    </li>
    <li className="print">
        Вильоти з трьох сторін мають бути по 3 мм (можна з 4-х сторін).
    </li>
    <li className="print">
        Всі елементи навиліт (фото або фоновий малюнок) повинні займати всю
        площу макета.
    </li>
    <li className="print">
        Текст та важливі елементи повинні знаходитися від краю різу на
        відстані не менше 7 мм.
    </li>
    <li className="print">
        Текст у кривих, або шрифти повинні бути вбудовані у публікацію.
    </li>
</div>
<div className="tverd-text25">
    <li className="print">Макет має бути у форматі *.pdf.</li>
    <li className="print">
        Неприпустимо надавати файли розворотами, приймаються лише
        посторінкові.
    </li>
    <li className="print">
        У макеті мають бути задані вильоти по 3 мм з кожної сторони.
    </li>
    <li className="print">
        Важилива інформація повинна розташовуватись не ближче 7 мм до краю
        макета з трьох зовнішніх сторін, а з внутрішньої сторони прошивки
        (пружини) – 15 мм.
    </li>
    <li className="print">
        Всі елементи навиліт (фото або фоновий малюнок) повинні займати всю
        площу макета.
    </li>
</div>
<div className="tverd-text26">
    <li className="print">
        • Місце свердління в макеті має бути вказане точкою контрастного
        кольору в колірній моделі CMYK (оскільки вона повинна залишитися
        після друку), діаметром 0,5 мм тільки з лицьової сторони, на звороті
        вказувати не потрібно. Розташовуватися точка повинна не ближче, ніж
        8,5 мм від краю макета, і текст та важливі елементи повинні
        розташовуватися не ближче, ніж 10 мм від точки свердління.
    </li>
    <li className="print">
        • Також при підготовці макета зі свердлінням необхідно враховувати
        наші особливості повороту (описано в розділі «Переворот макета») і,
        відповідно, розташування тексту та важливих елементів на обороті.
    </li>
    <li className="print">
        - Якщо в макеті відсутня відмітка свердління і в коментарях для
        дизайнера інформації немає, свердління робиться зверху по центру.
    </li>
</div>
<div className="tverd-text27">
    <li className="print">
        Для макетування євробуклета в нашій друкарні існує стандарт,
        вказаний нижче (лице 100 мм) - Євробуклет згин «внамотку»
    </li>
</div>
<div className="tverd-text28">
    <li className="print">Буклет на 3 фальці (згин «внамотку»)</li>
    <li className="print">
        Нижче вказано формулу для лицьової сторони макета буклета з трьома
        фальцями:
    </li>
    <li className="print">(а - 3 мм)(а - 2 мм)(а)(а)</li>
    <li className="print">тоді зворот, відповідно:</li>
    <li className="print">(а)(а)(а - 2 мм)(а - 3 мм).</li>
    <li className="print">
        Де «а» розмір «обкладинки» та «задника» буклета у складенному
        вигляді (розмір має бути однаковий),
    </li>
    <li className="print">
        «а – 2 мм» розмір третьої частини, що загинається. Віднімаємо від
        розміру лицьової сторони 2 мм,
    </li>
    <li className="print">
        «а – 3 мм» розмір четвертої частини, що загинається. Віднімаємо від
        розміру лицьової сторони 3 мм.
    </li>
    <li className="print">
        Наприклад, нам потрібен буклет із трьома фальцями, який у
        складенному вигляді буде розміром 100х200 мм. Ми вже знаємо, що
        «обкладинка» та «задник» у готовому вигляді будуть розміром по 100
        мм. Щоб дізнатися яким розміром макетувати дві інші частини, від
        розміру 100 мм віднімаємо 2 мм (третя сторона) і віднімаємо 3 мм
        (четверта сторона). Відповідно, 100 мм (обкладинка) – 2 мм = 98 мм
        (третя сторона), 100 мм – 3 мм = 97 мм (четверта сторона). Щоб
        дізнатися розмір буклета в розвороті, додаємо всі чотири сторони:
        100 мм + 100 мм + 98 мм + 97 мм = 395 мм.
    </li>
</div>


<img className="image-9-icon" alt="" src={image9}/>

<img className="image-10-icon" alt="" src={image10}/>

<img className="image-11-icon" alt="" src={image11}/>

<img className="image-12-icon" alt="" src={image12}/>

<img className="image-13-icon" alt="" src={image13}/>

<img className="image-14-icon" alt="" src={image14}/>

<img className="image-15-icon" alt="" src={image15}/>

<img className="image-16-icon" alt="" src={image16}/>

<img className="image-17-icon" alt="" src={image17}/>
        <Outlet/>
    </div>
        </div>
);
};

export default Bukletvimogi;