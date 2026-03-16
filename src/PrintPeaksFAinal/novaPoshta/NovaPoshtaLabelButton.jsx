/**
 * NovaPoshtaLabelButton — кнопка "Друкувати етикетку НП" через бекенд TCP socket + TSPL
 */

import React, { useState } from 'react';
import useQzTray from '../../hooks/useQzTray';

/**
 * @param {Object} props
 * @param {Object} props.waybill — об'єкт waybill з БД (intDocNumber, costOnSite, estimatedDeliveryDate, raw)
 * @param {Object} props.order — замовлення (id, User: { name, phoneNumber })
 * @param {string} [props.className] — додатковий CSS клас
 */
export default function NovaPoshtaLabelButton({ waybill, order, className = '' }) {
  const { printing, error, printLabel, clearError } = useQzTray();
  const [lastPrintOk, setLastPrintOk] = useState(false);

  if (!waybill?.intDocNumber) return null;

  const handlePrint = async () => {
    setLastPrintOk(false);
    clearError();

    try {
      // Збираємо дані з waybill.raw (відповідь NP API) або з waybill напряму
      const raw = waybill.raw || {};

      const labelData = {
        intDocNumber: waybill.intDocNumber,
        cityArea: (raw.CitySenderDescription || raw.CitySender || 'КИЇВ').toUpperCase()
          + ' ' + (raw.AreaRecipientDescription || '').toUpperCase(),
        cargoType: raw.CargoType === 'Documents' ? 'ДОКУМЕНТИ' : 'ПОСИЛКОВИЙ',
        warehouseCode: raw.WarehouseRecipientNumber || '',
        sendDate: raw.DateTime || '',
        senderType: raw.SenderContactPersonDescription ? 'Приватна особа' : '',
        senderName: raw.SenderDescription || '',
        senderAddress: raw.SenderAddressDescription || raw.WarehouseSenderDescription || '',
        senderPhone: raw.PhoneSender || '',
        recipientType: raw.RecipientOrganizationDescription || '',
        recipientName: raw.RecipientDescription || order?.User?.name || '',
        recipientAddress: raw.RecipientAddressDescription || raw.WarehouseRecipientDescription || '',
        recipientPhone: raw.PhoneRecipient || order?.User?.phoneNumber || '',
        weight: raw.Weight || raw.DocumentWeight || '',
        deliveryCost: raw.CostOnSite || waybill.costOnSite || '',
        payerType: raw.PayerType || '',
        paymentType: raw.PaymentMethod === 'Cash' ? 'готівка' : 'безг-ка',
        seatsAmount: raw.SeatsAmount || '1',
        orderId: order?.id || waybill.orderId || '',
      };

      await printLabel(labelData);
      setLastPrintOk(true);
      setTimeout(() => setLastPrintOk(false), 3000);
    } catch (err) {
      console.error('[NP Label] Print failed:', err);
    }
  };

  return (
    <button
      className={`npc-btn npc-btn-outline ${className}`}
      onClick={handlePrint}
      disabled={printing}
      title={error || 'Друк на EZPOS L4-W'}
      style={{
        opacity: printing ? 0.6 : 1,
        position: 'relative',
      }}
    >
      <span>
        {printing
          ? 'Друк...'
          : lastPrintOk
            ? 'Надруковано ✓'
            : 'ДРУК'}
      </span>
      {error && (
        <span
          style={{
            display: 'block',
            fontSize: 'var(--font-size-xs, 11px)',
            color: 'var(--adminred)',
            marginTop: 2,
          }}
        >
          {error.length > 40 ? error.substring(0, 40) + '...' : error}
        </span>
      )}
    </button>
  );
}
