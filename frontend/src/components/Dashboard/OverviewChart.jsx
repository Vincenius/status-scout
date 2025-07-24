import { RadarChart } from "@mantine/charts"
import calcScore from '@/utils/calcScore'

const OverviewChart = ({ data = [], flows = [] }) => {
  const uptimes = data.filter(d => d.check === 'uptime')
  const recentFuzz = data.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentHeaders = data.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSSL = data.filter(d => d.check === 'ssl').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentA11yCheck = data.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSeoCheck = data.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentLinks = data.filter(d => d.check === 'links').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentPerformance = data.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentCustomChecks = data.filter(d => d.check === 'custom').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]

  const performanceScores = Object.values(recentPerformance.result.details)
    .map(device => Object.values(device))
    .flat()
    .filter(m => m?.category !== 'NONE') // TODO handle missing pagespeed insights
    .map(metric => metric?.category === 'FAST' ? 100 : metric?.category === 'AVERAGE' ? 50 : 0)
  const performanceValue = Math.round((performanceScores.filter(u => u === 100).length / performanceScores.length) * 100)

  const fuzzScore = calcScore(recentFuzz.result.details.files.length, 20)
  const headersScore = calcScore(recentHeaders.result.details.missingHeaders.length, 10) // todo allow config to change headers (filter here)
  const sslScore = recentSSL.result.status === 'success' ? 0 : 100
  const securityScore = Math.max(Math.round(fuzzScore * 0.7 + headersScore * 0.3) - (sslScore / 2), 0);
  const linkScore = calcScore(recentLinks.result.details.length, 20)
  const seoScore = Math.max(Math.round(recentSeoCheck.result.details.score * 0.9 + linkScore * 0.1), 0);
  const customScore = (flows.length > 0 && recentCustomChecks?.result.length > 0)
    ? recentCustomChecks.result
      .map(r => r.result.status === 'success' ? 100 : 0)
      .reduce((p, c) => p + c, 0) / recentCustomChecks.result.length
    : null

  const chartData = [{
    name: 'Uptime',
    Score: Math.round((uptimes.filter(u => u.result.status === 'success').length / uptimes.length) * 100)
  }, {
    name: 'Security',
    Score: securityScore
  }, {
    name: 'Accessibility',
    Score: recentA11yCheck.result.details.score
  }, {
    name: 'SEO',
    Score: seoScore
  }, {
    name: 'Performance',
    Score: performanceValue
  }, customScore !== null ? {
    name: 'Custom Flows',
    Score: customScore
  } : null].filter(Boolean)

  return <>
    <RadarChart
      h={{ base: 200, xs: 300, md: 400 }}
      w={{ base: 320, xs: 400, md: 500 }}
      data={chartData}
      dataKey="name"
      withPolarRadiusAxis
      series={[{ name: 'Score', color: 'indigo.4', opacity: 0.2 }]}
      withTooltip
      withDots
    />
  </>
}

export default OverviewChart