import React from 'react';

function StatusBar({item}) {
    const style = {
        color:
            item.status === '0' ? '#000000' :
                item.status === '1' ? '#ffffff' :
                    item.status === '2' ? '#ffffff' :
                        item.status === '3' ? '#ffffff' :
                            item.status === '4' ? '#ffffff' :
                                '#ffffff',
        overflow: 'hidden',
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        // height: "100%",
        borderRadius: "0.3vw",
        alignItems: "center",
        justifyContent: "center",
        // height: "1.2vw",
        padding: "0.2vw",
        fontSize: "0.5vw",
        // color: "black",
        backgroundColor:
            item.status === '0' ? '#FBFAF6' :
                item.status === '1' ? '#8B4513' :
                item.status === '2' ? '#3C60A6' :
                    item.status === '3' ? '#F075AA' :
                        item.status === '4' ? '#008249' :
                            item.status === 'Відміна' ? '#ee3c23' :
                                '#F2F0E7',
    };
    return (
        <div className="adminFontTable d-flex align-content-center justify-content-center m-auto" style={style}>
            {/*{item.status}*/}
            {item.status === "-1"
                ? 'Скасоване'
                : item.status === "0"
                    ? 'Оформлення'
                    : item.status === "1"
                        ? 'Друкується'
                        : item.status === "2"
                            ? 'Постпресc'
                            : item.status === "3"
                                ? 'Готове'
                                : item.status === "4"
                                    ? 'Віддали'
                                    : 'Віддали'}
        </div>
    );
}

export default StatusBar;