export function trackConversion({
  id,
  value = 1.0,
  transactionId = ''
}) {
  if (!window.gtag || !id) return;

  window.gtag('event', 'conversion', {
    send_to: `${import.meta.env.VITE_GTM_ID}/${id}`,
    value,
    currency: 'EUR',
    transaction_id: transactionId,
  });
}