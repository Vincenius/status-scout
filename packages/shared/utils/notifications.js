export const checkDefaultNotifications = {
  'uptime': 'critical',
  'ssl': 'critical',
  'fuzz': 'daily',
  'headers': 'daily',
  'lighthouse': 'daily',
  'a11y': 'daily',
  'seo': 'daily',
  'performance': 'daily',
  'links': 'daily',
  // 'custom': 'daily', todo??
}

export const checkNameMap = {
  'uptime': 'Uptime',
  'ssl': 'SSL Certificate',
  'performance': 'Performance',
  'fuzz': 'Exposed Sensitive File',
  'headers': 'Missing Security Header',
  'lighthouse': 'Lighthouse',
  'a11y': 'Accessibility',
  'seo': 'SEO',
  'links': 'Broken Link',
  'custom': 'Custom Flow',
}

export const getNotificationMessage = ({ type, details }) => {
  const messageMap = {
    'uptime': 'Uptime check failed',
    'ssl': 'SSL certificate issue detected',
    'fuzz': `Sensitive file exposed: ${details}`,
    'headers': `Missing security header: ${details}`,
    'lighthouse': `Lighthouse issue detected: ${details}`,
    'a11y': `Accessibility issue detected: ${details}`,
    'seo': `SEO issue detected: ${details}`,
    'performance': `Performance issue detected: ${details}`,
    'links': `Broken link found: ${details}`,
    'custom': `Custom flow failed: ${details}`,
  }

  return messageMap[type]
}