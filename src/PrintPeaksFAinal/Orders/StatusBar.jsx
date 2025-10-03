import React from 'react';

function StatusBar({item}) {
    const style = {
        // color:
        //     item.status === '0' ? '#000000' :
        //         item.status === '1' ? '#ffffff' :
        //             item.status === '2' ? '#ffffff' :
        //                 item.status === '3' ? '#ffffff' :
        //                     item.status === '4' ? '#ffffff' :
        //                         '#ffffff',
        overflow: 'hidden',
        whiteSpace: "nowrap",
      width: '9vw',
      height: '5.5vh',

      fontWeight: '400',
      fontSize: '1.3vh',
      letterSpacing: '0.1rem',
      textTransform: 'uppercase',

        // textOverflow: "ellipsis",
      clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
      // borderRadius: "1vh",
        alignItems: "center",
        justifyContent: "center",

        // height: "1.2vw",

        // fontSize: "0.5vw",

        index: "1",
        backgroundColor:
            item.status === '0' ? '#FBFAF6' :
                item.status === '1' ? '#d3bda7' :
                item.status === '2' ? '#bbc5d3' :
                    item.status === '3' ? '#f1cbd4' :
                        item.status === '4' ? '#a9cfb7' :
                            item.status === 'Відміна' ? '#ee3c23' :
                                '#FBFAF6',
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
