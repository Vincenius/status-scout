export const getRecentChecks = (checks) => {
  const performanceCheck = checks.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const fuzzCheck = checks.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const headersCheck = checks.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const sslCheck = checks.filter(d => d.check === 'ssl').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const a11yCheck = checks.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const seoCheck = checks.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const linkCheck = checks.filter(d => d.check === 'links').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const customChecks = checks.filter(d => d.check === 'custom')
    .sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))

  return {
    performanceCheck,
    fuzzCheck,
    headersCheck,
    sslCheck,
    a11yCheck,
    seoCheck,
    linkCheck,
    customChecks,
  }
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
  // 'custom': 'daily', todo
}

export const notificationMap = {
  email: { label: 'E-Mail Address', placeholder: 'you@example.com', type: 'email' },
  sms: { label: 'Phone Number', placeholder: '123-456-7890', type: 'text' },
  ntfy: { label: 'ntfy Topic', placeholder: 'your-topic', type: 'text' },
}