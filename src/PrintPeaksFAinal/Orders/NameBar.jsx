import React from 'react';

function NameBar({item}) {


    return (
        <td className="adminFontTable d-flex flex-column justify-content-center align-content-center">
            {item.orderunits.map((item2, iter) => (
                <div className="adminFontTable">{item2.price1}</div>
            ))}

        </td>
);
}

export default NameBar;