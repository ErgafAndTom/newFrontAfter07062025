import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import viz2 from './public/viz2.png';
import viz3 from './public/viz3.png';
import viz4 from './public/viz4.png';
import bleed from "./public/bleed.png";
import "./Vimogi.css";

/* Підпис секції: eyebrow + порядковий номер + волосяна лінія */
export const VmgLabel = ({ num, children }) => (
    <h3 className="vmg-card__label">
        {num && <span className="vmg-card__num">{num}</span>}
        {children}
    </h3>
);

/* Ілюстрація з підписом — у брендовому стилі, без скруглень */
export const VmgFigure = ({ caption, children, single }) => (
    <figure className="vmg-figure">
        <div className={`vmg-figure__row${single ? ' vmg-figure__row--single' : ''}`}>
            {children}
        </div>
        {caption && <figcaption>{caption}</figcaption>}
    </figure>
);

/* Макети двостороннього друку — лице/зворот двома парами */
export const VmgDuplexFigure = () => (
    <VmgFigure caption="Макети для двостороннього друку">
        <div className="vmg-figure__pair">
            <img alt="" src={viz2} />
            <img alt="" src={viz3} />
        </div>
        <div className="vmg-figure__pair">
            <img alt="" src={viz2} />
            <img alt="" src={viz4} />
        </div>
    </VmgFigure>
);

export const VmgBleedFigure = () => (
    <VmgFigure single caption="Виліти — 2 мм якщо аркушева продукція (3 мм якщо багатосторінкова)">
        <img alt="" src={bleed} />
    </VmgFigure>
);

function Vimogi() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("colorprinthelp");

    // Оновлюємо активну вкладку при зміні URL.
    // Беремо ЛИШЕ перший сегмент після /Vimogi/ — інакше на вкладеному
    // маршруті (colorprinthelp/colortab) eventKey не збігається з жодною
    // вкладкою і підсвічування зникає або "залипає" на попередній.
    useEffect(() => {
        const path = location.pathname.replace('/Vimogi/', '').split('/')[0];
        if (path) setActiveTab(path);
    }, [location.pathname]);

    // Функція для зміни вкладки + оновлення URL
    const handleSelect = (eventKey) => {
        setActiveTab(eventKey);
        navigate(`/Vimogi/${eventKey}`);
    };

    return (
        <div className="vmg-page">
            <div className="vmg-head">
                <h1 className="vmg-head__title">Вимоги до макетів</h1>
                <p className="vmg-head__sub">Технічні вимоги PrintPeaks</p>
            </div>

            <Tabs
                activeKey={activeTab}
                onSelect={handleSelect}
                id="vimogiclas"
                className="vimogiclas nav-tabs"
                justify
            >
                <Tab className="nav-tabs" eventKey="colorprinthelp" title="Цифровий друк" />

                <Tab eventKey="ofsethelp" title="Офсетний друк">
                    <div className="vmg-content">
                        <section className="vmg-card">
                            <VmgLabel num="01">Загальні вимоги до файлів</VmgLabel>
                            <ul className="vmg-list">
                                <li>Макети приймаються у форматах <span className="vmg-mono">TIFF</span> <span className="vmg-mono">PDF</span> <span className="vmg-mono">PSD</span>.</li>
                                <li>Якість макетів — не менше <span className="vmg-mono">300 dpi</span>. Якщо неякісним зображенням примусово призначити 300 dpi, їх якість не покращиться — у цьому випадку краще замінити зображення якіснішими.</li>
                                <li>Елементи дизайну повинні розташовуватись не ближче <span className="vmg-mono">5 мм</span> від краю готового виробу.</li>
                                <li>Мінімальний післяобрізний розмір — <span className="vmg-mono">40×40 мм</span>.</li>
                                <li>Усі шари в растрових макетах повинні бути злиті в один.</li>
                                <li>У PDF-файлах не повинно бути OPI зв’язків.</li>
                                <li>Макет не повинен містити жодних ICC-профілів.</li>
                                <li>У макетах не повинно бути прозоростей «Transparency».</li>
                                <li>Мінімальна товщина ліній — <span className="vmg-mono">0,5 pt</span> (0,17 мм).</li>
                            </ul>
                        </section>

                        <section className="vmg-card">
                            <VmgLabel num="02">Вимоги до шрифтів</VmgLabel>
                            <ul className="vmg-list">
                                <li>Шрифти у векторних файлах необхідно конвертувати у криві.</li>
                                <li>Не допускається використання растрового тексту менше <span className="vmg-mono">8 pt</span> — інакше він може бути нечитабельним.</li>
                                <li>У шрифтах не допускається чорний композитний колір (що складається з 4 компонентів кольору).</li>
                                <li>Чорний текст має відповідати формулі <span className="vmg-mono">C0 M0 Y0 K100</span>.</li>
                                <li>Елементи чорного кольору <span className="vmg-mono">C0 M0 Y0 K100</span>, розташовані на однорідному тлі, а також текст повинні мати атрибут «overprint» (накладання).</li>
                            </ul>
                        </section>

                        <section className="vmg-card vmg-card--wide">
                            <VmgLabel num="03">Виліти та розкладка</VmgLabel>
                            <VmgBleedFigure />
                            <VmgDuplexFigure />
                        </section>

                        <section className="vmg-card vmg-card--wide">
                            <VmgLabel num="04">Вимоги до кольорів</VmgLabel>
                            <ul className="vmg-list">
                                <li>Колірна модель — <span className="vmg-mono">CMYK</span>, <span className="vmg-mono">Grayscale</span>.</li>
                                <li>Чорний колір плашок має бути <span className="vmg-mono">C60 M40 Y40 K100</span>. Якщо робити за формулою <span className="vmg-mono">C0 M0 Y0 K100</span>, то після друку можна отримати виріб сірого відтінку.</li>
                                <li>«Плашкові кольори» необхідно готувати з найменшими складовими CMYK для забезпечення точнішої передачі кольору.</li>
                                <li>Для білого тексту рекомендується робити треппінг на чорному композитному тлі — зовнішнє обведення елементів в одну фарбу завтовшки <span className="vmg-mono">0,25 pt</span> за формулою <span className="vmg-mono">C0 M0 Y0 K100</span>.</li>
                                <li>Для відтворення відтінків синього різниця між каналами Cyan і Magenta має становити не менше 20% (Cyan більше), наприклад <span className="vmg-mono">C100 M77 Y0 K0</span>. Якщо колір потрібно затемнити — додаємо Black.</li>
                                <li>Щоб отримати фіолетовий відтінок, Magenta має бути більшою або рівною Cyan (наприклад <span className="vmg-mono">C80 M93 Y0 K0</span>). Формула <span className="vmg-mono">C100 M100 Y0 K0</span> — це фіолетовий колір, навіть якщо на моніторі він виглядає синім.</li>
                                <li>Сірий колір в одну фарбу повинен мати насиченість не більше <span className="vmg-mono">C0 M0 Y0 K80</span>.</li>
                                <li>Не потрібно задавати сіру плашку трьома фарбами без чорної або чотирма, де відсоток кожної приблизно однаковий (<span className="vmg-mono">C68 M61 Y61 K50</span>, <span className="vmg-mono">C9 M7 Y8 K0</span>) — велика ймовірність різнотону у тиражі. Той самий колір краще задати як <span className="vmg-mono">C0 M8 Y7 K87</span> та <span className="vmg-mono">C0 M0 Y0 K11</span> відповідно.</li>
                                <li>У 4-колірних роботах (CMYK) елементи в колірному просторі RGB, LAB, а також PANTONE повинні бути перетворені на CMYK.</li>
                                <li>Мінімально відтворюваний відтінок за будь-яким каналом CMYK — <span className="vmg-mono">5%</span>.</li>
                            </ul>
                        </section>
                    </div>
                </Tab>

                <Tab eventKey="photoprinthelp" title="Друк фотографій" />

                <Tab eventKey="wideindustrialhelp" title="Широкоформатний промисловий друк">
                    <div className="vmg-content">
                        <section className="vmg-card vmg-card--wide">
                            <VmgLabel num="00">Допуски якості</VmgLabel>
                            <ul className="vmg-list">
                                <li>При виготовленні продукції допускаються технологічні відхилення й дефекти, які не проглядаються з відстані: <span className="vmg-mono">5 м</span> при якості 720 dpi, <span className="vmg-mono">3 м</span> при 1080 dpi, <span className="vmg-mono">1 м</span> при 1440 dpi.</li>
                            </ul>
                        </section>

                        <section className="vmg-card">
                            <VmgLabel num="01">Загальні вимоги до файлів</VmgLabel>
                            <ul className="vmg-list">
                                <li>Макети приймаються у форматах <span className="vmg-mono">TIFF</span> <span className="vmg-mono">PDF</span>.</li>
                                <li>Якість макетів до формату А3 — <span className="vmg-mono">200 dpi</span>, більше за А3 — <span className="vmg-mono">150 dpi</span>.</li>
                                <li>У форматі PDF шрифти мають бути переведені у криві.</li>
                                <li>Макети мають бути в колірному просторі CMYK без будь-яких колірних профілів.</li>
                                <li>Макети мають бути підготовлені у масштабі <span className="vmg-mono">1:1</span> (без вильотів).</li>
                                <li>Макети обрізаються в край, тому краще робити безпечну зону від значущих елементів до краю макета мінімум <span className="vmg-mono">5 мм</span>.</li>
                                <li>Під установку люверсів безпечна зона має бути щонайменше <span className="vmg-mono">25 мм</span> від краю макета.</li>
                                <li>У макетах мають бути злиті шари, а текст переведений у криві.</li>
                                <li>Мітки під індивідуальне розташування люверсів виконуються контрастним кольором — кружки діаметром <span className="vmg-mono">10 мм</span> з обведенням; центр кола не ближче <span className="vmg-mono">20 мм</span> від краю макета.</li>
                            </ul>
                        </section>

                        <section className="vmg-card">
                            <VmgLabel num="02">Колір</VmgLabel>
                            <ul className="vmg-list">
                                <li>Чорний колір (плашки та великий текст) краще робити композитним CMYK <span className="vmg-mono">35-35-35-100</span>.</li>
                                <li>Градієнти та суцільні заливки у сумі фарб мають бути не менше <span className="vmg-mono">30%</span> за TIL — інакше плашка або градієнт можуть бути малопомітними.</li>
                                <li>Суцільний чорний колір не може бути представлений у CMY без чорного — є вірогідність отримати після друку інший тріадний колір.</li>
                                <li>Дрібний текст (<span className="vmg-mono">12 pt</span>) можна залишати в одну фарбу для чіткішого друку.</li>
                            </ul>
                        </section>

                        <section className="vmg-card">
                            <VmgLabel num="03">Цілісний друк або розбиття на тайли</VmgLabel>
                            <ul className="vmg-list">
                                <li>Банер: максимальна ширина рулону <span className="vmg-mono">3200 мм</span>. Якщо коротша сторона макета більша за <span className="vmg-mono">3180 мм</span> — замовлення складатиметься з тайлів. Із підворотами максимум за короткою стороною — <span className="vmg-mono">3100 мм</span>.</li>
                                <li>Самоклеюча плівка: максимальна ширина рулону <span className="vmg-mono">1600 мм</span>, отже коротша сторона — до <span className="vmg-mono">1580 мм</span>. Для перфораційної плівки One Way Vision — <span className="vmg-mono">1500 мм</span>.</li>
                                <li>Папір: ширина рулону <span className="vmg-mono">1560 мм</span>, менша сторона виробу — не більше <span className="vmg-mono">1540 мм</span>.</li>
                            </ul>
                        </section>

                        <section className="vmg-card">
                            <VmgLabel num="04">Плотерна порізка</VmgLabel>
                            <ul className="vmg-list">
                                <li>Макет для плотерної порізки не має перевищувати <span className="vmg-mono">1100×2000 мм</span>.</li>
                                <li>Макет наклейки подається у <span className="vmg-mono">*.pdf</span> і містить два шари: нижній — сам макет з вильотами, верхній — контур порізки.</li>
                                <li>Макет наклейки може бути вектором або растром, потрібної форми та розміру <span className="vmg-mono">1:1</span>, з вильотами по <span className="vmg-mono">2 мм</span> з кожного боку продовженням фону.</li>
                                <li>Якщо фон наклейки білий, вильоти можна не додавати. Для всіх важливих елементів (текст, зображення, штрих-код) має бути безпечна зона <span className="vmg-mono">2 мм</span> «всередину» від контуру різання.</li>
                                <li>Контур різу — векторний, замкнутий, у масштабі 1:1, заданий окремим Spot color <span className="vmg-mono">cut</span> із атрибутом Overprint.</li>
                                <li>Колір контуру може бути будь-яким, але бажано контрастним: червоний <span className="vmg-mono">C0 M100 Y100 K0</span> або рожевий <span className="vmg-mono">C0 M100 Y0 K0</span>.</li>
                            </ul>
                        </section>
                    </div>
                </Tab>

                <Tab eventKey="plotercuthelp" title="Плотерна порізка" />
                <Tab eventKey="layouthelp" title="Препрес / Постпрес" />
                <Tab eventKey="Sublimationhelp" title="Сублімація" />
            </Tabs>

            <Outlet />
        </div>
    );
}

export default Vimogi;
