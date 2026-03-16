import React from "react";

const OneOrderButton = ({item, thisOrder}) => {
    const s = String(item.status);
    const BG_MAP = {
        '0': 'rgb(224,224,224)', '1': '#f5a623', '2': '#3c60a6',
        '3': '#0e935b', '4': '#6a5acd', '-1': '#ee3c23',
    };
    const style = {
        color: '#000000',
        backgroundColor: BG_MAP[s] || '#ee3c23',
    };

    return (
        <div
            className={item.id === thisOrder.id ? 'hoverOneOrderButton hoverOneOrderButtonThis' : 'hoverOneOrderButton'}
            style={style}
        >
            {"\u2116"} {item.id}
            {/*<svg width={"100%"} height={"2vh"}>*/}
            {/*    <g>*/}
            {/*        <rect*/}
            {/*            // className={item.id === thisOrder.id ? 'hoverOneOrderButton i' : 'hoverOneOrderButton i'}*/}
            {/*            width={110}*/}
            {/*            height={17}*/}
            {/*            rx={4}*/}
            {/*            style={style}*/}
            {/*        />*/}
            {/*        <text className="h" transform="translate(55 13)">*/}
            {/*            <tspan x={-32.543} y={0}>*/}
            {/*                {"\u2116"} {item.id}*/}
            {/*            </tspan>*/}
            {/*        </text>*/}
            {/*    </g>*/}
            {/*</svg>*/}

        </div>
    )

    // return (
    //     <div
    //         // className={item.id === thisOrder.id ? 'm-1 adminFontTable btn hoverBlack shadowActElem w-100' : 'm-1 adminFont btn hoverBlack w-100'}
    //         style={style}
    //     >
    //         <svg width={"100%"} height={"100%"}>
    //             <g>
    //                 <rect className="i" width={110} height={17} rx={4}/>
    //                 <text className="h" transform="translate(55 13)">
    //                     <tspan x={-32.543} y={0}>
    //                         {"\u2116 10001"} {item.id}
    //                     </tspan>
    //                 </text>
    //             </g>
    //         </svg>
    //     </div>
    // );
};

export default OneOrderButton;