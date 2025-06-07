import React, {useState} from 'react';

export const CrmSettings = ({name}) => {
    const [whoPick, setWhoPick] = useState("");

    const pickFunc = (e) => {
        setWhoPick(e.target.getAttribute("toclick"));
    };
    return (
        <div>

        </div>
    )
}