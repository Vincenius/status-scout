export const getRecentChecks = (checks) => {
  const performanceCheck = checks.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const fuzzCheck = checks.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const headersCheck = checks.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const sslCheck = checks.filter(d => d.check === 'ssl').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const a11yCheck = checks.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const seoCheck = checks.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const linkCheck = checks.filter(d => d.check === 'links').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const customChecks = checks.filter(d => d.check === 'custom').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]

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