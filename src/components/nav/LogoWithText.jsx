import React, { useRef, useEffect, useState } from 'react';
import logo from './logo/logo.svg';
import './LogoWithText.css';

const LogoWithText = ({ logoSrc }) => {
  const imgRef = useRef(null);
  const [fontSize, setFontSize] = useState();
  const handleLogoClick = () => {
    window.open('https://printpeaks.com.ua', '_blank');
  };

  useEffect(() => {
    const updateFontSize = () => {
      if (imgRef.current) {
        const imgHeight = imgRef.current.clientHeight;

      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  return (
    <div className="logoContainerCentered shinyComboWrapper d-flex align-items-center justify-content-center" onClick={handleLogoClick}  style={{cursor: 'pointer'}}>
      <div className="shinyOverlayUnified d-flex align-items-center justify-content-center"></div>

      {/* Лого по центру */}
      <img
        src={logo}
        ref={imgRef}
        onClick={handleLogoClick}
        className="d-flex align-items-center justify-content-center"
        alt="logo"
        style={{
          height: '2rem',

          // objectFit: 'contain',
          // background: 'transparent',
        }}
      />

      {/* ERP — позиція відносно лого */}
      {/*<div*/}
      {/*  className="shinyFaded shinyTextCombo"*/}
      {/*  onClick={handleLogoClick}*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    top: '0.6vh',*/}
      {/*    right: '0vw', // ключове — ставимо прив’язку до правого краю*/}
      {/*    fontSize: '0.6vw',*/}
      {/*    fontFamily: 'Montserrat, sans-serif',*/}
      {/*    fontWeight: 'bold',*/}
      {/*    color: 'black', // або білий, залежно від фону*/}

      {/*  }}*/}
      {/*>*/}
      {/*  ERP*/}
      {/*</div>*/}
      {/*<div className="shinyFaded shinyTextCombo"*/}
      {/*     onClick={handleLogoClick}*/}
      {/*     style={{*/}
      {/*       position: 'absolute',*/}
      {/*       top: '1vw',*/}
      {/*       right: '0vw', // ключове — ставимо прив’язку до правого краю*/}
      {/*       fontSize: '0.4vw',*/}
      {/*       fontFamily: 'Montserrat, sans-serif',*/}
      {/*       fontWeight: 'bold',*/}
      {/*       color: 'black', // або білий, залежно від фону*/}

      {/*     }}>v.12.03</div>*/}

    </div>
  );


};

export default LogoWithText;
