import Layout from '@/components/Layout/AppLayout'
import { Box, Card, Flex, Text, ThemeIcon, Title, LoadingOverlay, Divider } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconListCheck, IconShieldLock, IconZoomCode } from '@tabler/icons-react'
import { useAuthSWR } from '@/utils/useAuthSWR'
import HistoryChart from '@/components/Dashboard/HistoryChart';
import Overview from '@/components/Dashboard/Overview';
// import { linkMock } from '@/utils/mockData'

function Dashboard() {
  const { data = {}, error, isLoading: isLoadingUser } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const { data: flows = [], isLoading: isLoadingFlows } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/flows`)
  const { data: uptime = {}, isLoading: isLoadingUptime } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user/uptime`)

  const isLoading = isLoadingUser || isLoadingFlows || isLoadingUptime

  const { user, checks } = data

  // todo move to overview?
  if (isLoading || !user || !checks.length) {
    return (
      <Layout title="Dashboard">
        <Title mb="xl" order={1} fw="normal">Dashboard</Title>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Layout>
    )
  }

  // todo empty & loading & error state?

  const spacing = { base: 'md', md: 'md' }
  const securityChecks = checks.filter(d => d.check === 'fuzz' || d.check === 'headers' || d.check === 'ssl')
  const groupedSecurityChecks = securityChecks.reduce((acc, item) => {
    acc[item.createdAt] = acc[item.createdAt] || [];
    acc[item.createdAt].push(item);
    return acc;
  }, {});
  const mappedSecurityChecks = Object.entries(groupedSecurityChecks)
    .map(([key, val]) => ({
      result: {
        status: val.every(d => d.result.status === 'success') ? 'success' : 'fail',
        details: val.filter(d => d.result.status !== 'success')
      },
      createdAt: key
    })).sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))

  // const triggerCheck = async () => {
  //   await fetch(`${import.meta.env.VITE_API_URL}/v1/check`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     credentials: 'include',
  //     body: JSON.stringify({}),
  //   }).then(res => console.log(res))
  // }

  return (
    <Layout title="Dashboard">
      <Title mb="xl" order={1} fw="normal">Dashboard</Title>

      <Box maw={1800} mx="auto">
        <Overview {...{ data, isLoading, flows, uptime  }}/>

        <Flex mb="md" gap={spacing} direction={{ base: 'column', md: 'row' }}>
          <Card withBorder shadow="md" w="100%">
            <Title mb="md" order={2} size="h3" fw="normal">Status Checks</Title>

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconChartBar style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Uptime</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'uptime').sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))} />
            </Box>

            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconShieldLock style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Security</Text>
              </Flex>

              <HistoryChart data={mappedSecurityChecks} />
            </Box>

            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconAccessible style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Accessibility</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))} />
            </Box>

            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconZoomCode style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">SEO</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))} />
            </Box>


            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Performance</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))} />
            </Box>
          </Card>
          <Card withBorder shadow="md" w="100%">
            <Title mb="md" order={2} size="h3" fw="normal">Custom Flows</Title>

            {flows.map((item, index) => (
              <Box key={index}>
                <Box>
                  <Flex gap="xs" align="center" mb="xs">
                    <ThemeIcon variant="default" size="md">
                      <IconListCheck style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text size="sm">{item.name}</Text>
                  </Flex>


                  <HistoryChart
                    data={checks
                      .filter(d => d.check === 'custom')
                      .map(c => ({
                        createdAt: c.createdAt,
                        ...c.result.find(r => r.name === item.name),
                      }))
                      .filter(Boolean)
                      .sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))
                    }
                  />
                </Box>

                {index !== flows.length - 1 && <Divider my="sm" />}
              </Box>
            ))}
          </Card>
        </Flex>
      </Box>
    </Layout >
  )
}

export default Dashboard
