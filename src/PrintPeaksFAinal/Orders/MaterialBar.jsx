import React from 'react';

function MaterialBar({item}) {


    return (
        <td className="adminFontTable d-flex flex-column justify-content-center align-content-center">
            {item.orderunits.map((item2, iter) => (
                <div className="adminFontTable">{item2.name}</div>
            ))}

        </td>
    );
}

export default MaterialBar;