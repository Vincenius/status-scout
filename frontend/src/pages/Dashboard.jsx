import Layout from '@/components/Layout/Layout'
import { Box, Card, Flex, SimpleGrid, Text, ThemeIcon, Title, Tooltip, LoadingOverlay, Divider } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconListCheck, IconShieldLock, IconZoomCode } from '@tabler/icons-react'
import { RadarChart } from '@mantine/charts';
import { useMediaQuery } from '@mantine/hooks'
import { useAuthSWR } from '@/utils/useAuthSWR'

function calcFuzzScore(count, maxAmount) {
  if (count <= 0) return 100;
  if (count >= maxAmount) return 0;

  // Quadratic decay
  const s = 100 * Math.pow(1 - count / maxAmount, 2);
  return Math.round(s);
}

const OverviewChart = ({ data = [], flows = [] }) => {
  const uptimes = data.filter(d => d.check === 'uptime')
  const recentFuzz = data.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentHeaders = data.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentA11yCheck = data.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSeoCheck = data.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentPerformance = data.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentCustomChecks = data.filter(d => d.check === 'custom').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]

  const performanceScores = Object.values(recentPerformance.result.details)
    .map(device => Object.values(device))
    .flat()
    .filter(m => m?.category !== 'NONE') // TODO handle missing pagespeed insights
    .map(metric => metric?.category === 'FAST' ? 100 : metric?.category === 'AVERAGE' ? 50 : 0)
  const performanceValue = Math.round((performanceScores.filter(u => u === 100).length / performanceScores.length) * 100)

  const fuzzScore = calcFuzzScore(recentFuzz.result.details.files.length, 20)
  const headersScore = calcFuzzScore(recentHeaders.result.details.missingHeaders.length, 10) // todo allow config to change headers (filter here)
  const securityScore = Math.round(fuzzScore * 0.7 + headersScore * 0.3);
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
    Score: recentSeoCheck.result.details.score
  }, {
    name: 'Performance',
    Score: performanceValue
  }, customScore !== null ? {
    name: 'Custom Flows',
    Score: customScore
  } : null].filter(Boolean)

  const totalScore = chartData.reduce((p, c) => p + c.Score, 0) / chartData.length

  return <>
    <Text ta="center" mb="xs">Website Health Score:</Text>
    <Text
      order={2} mb="0" ta="center" size="2em" lh="1em" fw="bold" td="underline"
      c={totalScore < 50 ? 'red' : totalScore < 80 ? 'yellow' : 'green'}
    >
      {totalScore.toFixed(0)}       {/* todo count up animation */}
    </Text>
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

const Chart = ({ data = [] }) => {
  // figure out current screen size
  const isXxs = useMediaQuery('(max-width: 24em)');
  const isXs = useMediaQuery('(max-width: 36em)');
  const isSm = useMediaQuery('(max-width: 48em)');
  const isMd = useMediaQuery('(max-width: 62em)');
  const isLg = useMediaQuery('(max-width: 75em)');

  let visibleCount = 40;
  if (isXxs) visibleCount = 20;
  else if (isXs) visibleCount = 30;
  else if (isSm) visibleCount = 40;
  else if (isMd) visibleCount = 20;
  else if (isLg) visibleCount = 30;

  // take only last N items
  const visibleData = data.slice(-visibleCount);

  // pad up to visibleCount
  const paddedData = [
    ...Array.from({ length: Math.max(visibleCount - visibleData.length, 0) }, () => null),
    ...visibleData,
  ];

  return (
    <SimpleGrid
      spacing={3}
      cols={visibleCount}
    >
      {paddedData.map((item, index) =>
        (item && item.result) ? (
          <Tooltip key={index} label={new Date(item.createdAt).toLocaleString()}>
            <Card
              h={40}
              w={10}
              p="0"
              bg={item.result?.status === 'success' ? 'green' : 'red'}
            />
          </Tooltip>
        ) : (
          <Card
            key={index}
            h={40}
            w={10}
            p="0"
            // bg="white"
            withBorder
          />
        )
      )}
    </SimpleGrid>
  );
};

function Dashboard() {
  const { data = [], error, isLoading } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const { data: flows = [], isLoading: isLoadingFlows } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/flows`)

  if (isLoading || isLoadingFlows || !data.length) {
    return (
      <Layout title="Dashboard">
        <Title mb="xl" order={1} fw="normal">Dashboard</Title>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Layout>
    )
  }

  // todo empty state?

  return (
    <Layout title="Dashboard">
      <Title mb="xl" order={1} fw="normal">Dashboard</Title>

      {/* todo time filter */}
      {/* <Box mb="xl">
        <Flex mb="xs" gap="3px">
          {mockData.status.length < 60 ? Array.from({ length: 60 - mockData.status.length }).map((_, index) => (
            <Card key={index} h={100} w={20} p="0" bg="white" withBorder></Card>
          )) : <></>}
          {mockData.status.map((item, index) => (
            <Tooltip key={index} label={new Date(item.time).toLocaleString()}>
              <Card h={100} w={20} p="0" bg={item.failed.length === 0 ? 'green' : 'red'}></Card>
            </Tooltip>
          ))}
        </Flex>
      </Box> */}

      <Flex mb="xl">
        <Card withBorder shadow="md">
          <OverviewChart data={data} flows={flows} />
        </Card>
      </Flex>

      <SimpleGrid cols={{ xs: 1, sm: 2 }} mb="md" maw={1600}>
        <Card withBorder shadow="md" maw={720}>
          <Title mb="md" order={2} size="h4" fw="normal">Status Checks</Title>

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconChartBar style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Uptime</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'uptime')} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconShieldLock style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Security</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'fuzz')} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconAccessible style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Accessibility</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'a11y')} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconZoomCode style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">SEO</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'seo')} />
          </Box>


          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Performance</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'performance')} />
          </Box>
        </Card>
        <Card withBorder shadow="md" maw={720}>
          <Title mb="md" order={2} size="h4" fw="normal">Custom Flows</Title>

          {flows.map((item, index) => (
            <Box key={index}>
              <Box>
                <Flex gap="xs" align="center" mb="xs">
                  <ThemeIcon variant="default" size="md">
                    <IconListCheck style={{ width: '70%', height: '70%' }} />
                  </ThemeIcon>
                  <Text size="sm">{item.name}</Text>
                </Flex>


                <Chart
                  data={data
                    .filter(d => d.check === 'custom')
                    .map(c => ({
                      createdAt: c.createdAt,
                      ...c.result.find(r => r.name === item.name),
                    }))
                    .filter(Boolean)}
                />
              </Box>

              {index !== flows.length - 1 && <Divider my="sm" />}
            </Box>
          ))}
        </Card>
      </SimpleGrid>
      {/* <Card withBorder shadow="md">
        <Title mb="md" order={2} size="h4" fw="normal">Logs</Title>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Message</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mockData.logs.map((item, index) => (
              <Table.Tr key={index} bg={item.status === 'fail' ? 'red.0' : 'green.0'}>
                <Table.Td>{new Date(item.time).toLocaleString()}</Table.Td>
                <Table.Td>{item.message}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card> */}
    </Layout>
  )
}

export default Dashboard
