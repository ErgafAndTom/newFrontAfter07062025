import React from 'react';
import PropTypes from 'prop-types';
import { SiViber } from 'react-icons/si';

/**
 * ViberAvatar
 * Простий компонент для відкриття веб-версії Viber з передзаповненим номером.
 * Використовує тільки invite.viber.com для переходу.
 * @param {string} link - Телефон у будь-якому форматі, необов'язково з '+'.
 * @param {number} size - Розмір іконки в пікселях (за замовчуванням 32).
 */
const ViberAvatar = ({ link, size = 32 }) => {
  if (!link) return null;
  // Очищення номера: лише цифри
  const digits = link.replace(/\D+/g, '');
  if (!digits) return null;

  // Веб-посилання до Viber Invite
  const inviteLink = `https://invite.viber.com/?number=${digits}`;

  return (
    <a
      href={inviteLink}
      target="_blank"
      rel="noopener noreferrer"
      title={`Viber: +${digits}`}
      style={{ display: 'inline-block', width: size, height: size }}
    >
      <SiViber size={size} style={{ color: '#665cac' }} />
    </a>
  );
};

ViberAvatar.propTypes = {
  link: PropTypes.string.isRequired,
  size: PropTypes.number
};

export default ViberAvatar;
