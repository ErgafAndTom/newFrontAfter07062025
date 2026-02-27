import React from 'react';
import PropTypes from 'prop-types';
import noAvatar from "./noAvatar.svg";
import noLinkAvatar from "./noLinkAvatar.svg";
import errorAvatarTelegram from "./errorAvatarTelegram.svg";
import notTrueTelegramNoAcc from "./notTrueTelegramNoAcc.svg";

/**
 * Компонент для відображення аватарки Telegram або контактного телефону.
 * Підвантажує аватар за стандартним URL, при помилці завантаження показує дефолтне зображення.
 * Для телефонів використовує tel: посилання та показує дефолтне зображення.
 * При наведенні показує підказку з ніком або номером.
 * @param {string} link - Telegram URL або @username або номер телефону (+380...) без пробілів.
 * @param {number} size - Розмір аватарки в пікселях (за замовчуванням 32).
 * @param {string} defaultSrc - Посилання на дефолтне зображення при помилці (або для телефону).
 */
const TelegramAvatar = ({ link, size = 32, defaultSrc = '/default-avatar.png' }) => {
  if (!link) return (
    <div
      rel="noopener noreferrer"
      style={{ display: 'inline-block', width: size, height: size }}
    >
      <img
        src={noLinkAvatar}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
        onError={e => {
          e.target.onerror = null;
          e.target.src = errorAvatarTelegram;
        }}
      />
    </div>
  );

  // Визначаємо, чи це телефон (складається тільки з цифр та +)
  const phonePattern = /^\+?\d+$/;
  let profileUrl;
  let avatarUrl;
  let username;

  if (phonePattern.test(link)) {
    // телефон
    username = link.startsWith('+') ? link : `+${link}`;
    profileUrl = `tel:${username}`;
    avatarUrl = defaultSrc;
  } else {
    // Telegram URL або @username
    username = link;
    if (username.startsWith('@')) {
      username = username.substring(1);
    } else {
      const segments = link.split('/').filter(Boolean);
      username = segments[segments.length - 1];
    }
    profileUrl = `https://t.me/${username}`;
    avatarUrl = `https://t.me/i/userpic/320/${username}.jpg`;
  }

  // Підпис підказки: @username або номер телефону
  const displayName = phonePattern.test(link) ? username : `@${username}`;
  // if(defaultSrc === '/default-avatar.png'){
  //   return (
  //     <a
  //       href={profileUrl}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       title={displayName}
  //       style={{ display: 'inline-block', width: size, height: size }}
  //     >
  //       {/*<img*/}
  //       {/*  src={avatarUrl}*/}
  //       {/*/>*/}
  //     </a>
  //   )
  // }
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={displayName}
      style={{ display: 'inline-block', width: size, height: size }}
    >
      <img
        src={avatarUrl}
        alt={username}
        title={displayName}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
        onError={e => {
          e.target.onerror = null;
          e.target.src = errorAvatarTelegram;
          // e.target.alt = username[0]?.toUpperCase();
        }}
      />
    </a>
  );
};

TelegramAvatar.propTypes = {
  link: PropTypes.string.isRequired,
  size: PropTypes.number,
  defaultSrc: PropTypes.string
};

export default TelegramAvatar;
