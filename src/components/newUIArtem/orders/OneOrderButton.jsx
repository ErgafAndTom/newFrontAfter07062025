import React from "react";

const OneOrderButton = ({item, thisOrder}) => {
    const style = {
        color:
        //     item.status === 'створено' ? '#000000' :
        //         item.status === 'В роботі' ? '#00ffe7' :
        //             item.status === 'Зроблено' ? '#ffffff' :
        //                 item.status === 'Відвантажено' ? '#ffea00' :
        //                     item.status === 'Відміна' ? '#72ff00' :
                                '#000000',
        backgroundColor:
            item.status === 'Cтворено' ? 'rgb(224,224,224)' :
                item.status === 'В роботі' ? '#fab416' :
                    item.status === 'Зроблено' ? '#008249' :
                        item.status === 'Відвантажено' ? '#3c60a6' :
                            item.status === 'Відміна' ? '#ee3c23' :
                                '#ee3c23',
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