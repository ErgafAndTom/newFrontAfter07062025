import React, { useRef, useEffect, useState } from 'react';
// import * as d3 from 'd3';

const ChartComponent = ({ aapl }) => {
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 928, height: 500 });
    const tooltipRef = useRef();

    useEffect(() => {
        function handleResize() {
            setDimensions({
                width: svgRef.current.clientWidth,
                height: svgRef.current.clientHeight
            });
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!aapl || aapl.length === 0) return;

        const svg = d3.select(svgRef.current);
        const { width, height } = dimensions;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;

        const xScale = d3.scaleLinear().domain(d3.extent(aapl, d => d.count)).range([marginLeft, width - marginRight]);
        const yScale = d3.scaleLinear().domain([0, d3.max(aapl, d => d.price)]).range([height - marginBottom, marginTop]);

        const xAxis = d3.axisBottom(xScale);
        svg.select('.xAxis').call(xAxis);

        const yAxis = d3.axisLeft(yScale);
        svg.select('.yAxis').call(yAxis);

        const line = d3.line()
            .x(d => xScale(d.count))
            .y(d => yScale(d.price));

        svg.select('.line')
            .datum(aapl)
            .attr('d', line);

        const focus = svg.append('g').style('display', null); // Changed from 'none' to null

        focus.append('circle')
            .attr('r', 4.5);

        focus.append('text')
            .attr('x', 9)
            .attr('dy', ".35em");

        svg.append('rect')
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .attr('width', width)
            .attr('height', height)
            // .on('mousemove', function(event) {
            //     const pointer = d3.pointer(event);
            //     const x0 = xScale.invert(pointer[0]);
            //     let i = d3.bisect(aapl, x0, 1, 999);
            //     let d0 = aapl[i - 1];
            //     let d1 = aapl[i];
            //     let d = x0 - d0.count > d1.count - x0 ? d1 : d0;
            //
            //     focus.attr('transform', `translate(${xScale(d.count)},${yScale(d.price)})`);
            //     focus.select('text').text(`x:${d.count}, y:${d.price}`);
            // });
    }, [aapl, dimensions]);

    return (
        <svg ref={svgRef} width="100%" height="500">
            <path className="line" fill="none" stroke="steelblue" strokeWidth="1.5" />
            <g className="xAxis" transform={`translate(0, ${dimensions.height - 30})`} />
            <g className="yAxis" transform={`translate(${40},0)`} />
            <div ref={tooltipRef} style={{position: 'absolute', visibility: 'hidden', padding: '10px', background: 'white', border: '1px solid black'}}></div>
        </svg>
    );
};

export default ChartComponent;