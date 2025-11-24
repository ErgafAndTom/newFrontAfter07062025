import { MainButton, useShowPopup } from '@vkruglikov/react-telegram-web-app';
import React, {useEffect, useState, useRef} from "react";

const ContentTest = () => {
  const showPopup = useShowPopup();

  const handleClick = () =>
    showPopup({
      message: 'Hello, I am popup',
    });

  return <MainButton text="SHOW POPUP" onClick={handleClick} />;
};

export default ContentTest;

