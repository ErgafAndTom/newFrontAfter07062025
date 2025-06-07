import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import NoteVisual from "./NoteVisual";

// Компонент блокнота
const Notebook = ({
                      initialWidth = 300,      // Исходная ширина для построения (логическая)
                      initialHeight = 400,     // Исходная высота для построения (логическая)
                      pages = 50,              // Количество страниц
                      paperTexture,            // URL текстуры для страниц
                      coverTexture             // URL текстуры для обложки
                  }) => {
    const svgRef = useRef();
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        // Очистка SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Устанавливаем viewBox для динамического масштабирования
        svg
            .attr('viewBox', `0 0 ${initialWidth} ${initialHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            // .style('width', '100%')
            // .style('height', '100%');

        // Задаём внутренние отступы для страниц
        const pageMargin = 20;
        const pageWidth = initialWidth - 2 * pageMargin;
        const pageHeight = initialHeight - 2 * pageMargin;

        // Толщина блокнота (каждая страница добавляет небольшое смещение)
        const thicknessPerPage = 0.5;
        const notebookThickness = pages * thicknessPerPage;

        // Определяем SVG паттерны для текстур, если заданы
        const defs = svg.append('defs');

        if (coverTexture) {
            defs.append('pattern')
                .attr('id', 'coverTexture')
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('width', 100)
                .attr('height', 100)
                .append('image')
                .attr('href', coverTexture)
                .attr('width', 100)
                .attr('height', 100)
                .attr('preserveAspectRatio', 'xMidYMid slice');
        }

        if (paperTexture) {
            defs.append('pattern')
                .attr('id', 'paperTexture')
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('width', 100)
                .attr('height', 100)
                .append('image')
                .attr('href', paperTexture)
                .attr('width', 100)
                .attr('height', 100)
                .attr('preserveAspectRatio', 'xMidYMid slice');
        }

        // Рисуем обложку блокнота
        svg.append('rect')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', initialWidth - 20)
            .attr('height', initialHeight - 10)
            .attr('rx', 5)
            .attr('fill', coverTexture ? 'url(#coverTexture)' : '#ccc')
            .attr('stroke', '#333')
            .attr('stroke-width', 2);

        // Рисуем страницы блокнота с небольшим смещением для эффекта толщины
        for (let i = 0; i < pages; i++) {
            svg.append('rect')
                .attr('class', 'page')
                .attr('x', pageMargin + i * 0.1)
                .attr('y', pageMargin + i * 0.1)
                .attr('width', pageWidth)
                .attr('height', pageHeight)
                .attr('fill', paperTexture ? 'url(#paperTexture)' : '#fff')
                .attr('stroke', '#ddd')
                .attr('stroke-width', 1)
                .style('cursor', 'pointer')
                .on('click', () => setCurrentPage(prev => (prev + 1) % pages));
        }

        // Рисуем пластиковую пружину (спираль) слева
        const spiralX = pageMargin / 2;
        const spiralYStart = pageMargin;
        const spiralYEnd = pageMargin + pageHeight;
        const spiralSpacing = pageHeight / pages;
        for (let i = 0; i < pages; i++) {
            svg.append('circle')
                .attr('cx', spiralX)
                .attr('cy', spiralYStart + i * spiralSpacing)
                .attr('r', 3)
                .attr('fill', '#007acc');
        }

        // Выделяем текущую страницу
        svg.selectAll('.page')
            .filter((d, i) => i === currentPage)
            .attr('stroke', '#ff6600')
            .attr('stroke-width', 2);

    }, [initialWidth, initialHeight, pages, paperTexture, coverTexture, currentPage]);

    return <svg ref={svgRef}></svg>;
};

// Обёртка для динамического масштабирования в пределах 25vw × 25vw
const NotebookContainer = ({
                               pages,
                               paperTexture,
                               coverTexture,
                               initialWidth,
                               initialHeight
                           }) => {
    return (
        <div
            style={{
                width: '25vh',
                height: '25vh',
                border: '1px solid #ccc',
                overflow: 'hidden',
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',

            }}
        >
            <NoteVisual
                pages={pages}
                paperTexture={paperTexture}
                coverTexture={coverTexture}
                width={initialWidth}
                height={initialHeight}
            />
        </div>
    );
};

export default Notebook;
