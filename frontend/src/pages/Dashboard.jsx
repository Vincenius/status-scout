import { useState } from 'react';
import Layout from '@/components/Layout/Layout'
import { Box, Card, Flex, SimpleGrid, Text, ThemeIcon, Title, LoadingOverlay, Divider, Modal, List, Blockquote, Tabs, ActionIcon } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconCheck, IconDeviceDesktop, IconDeviceMobile, IconExclamationMark, IconListCheck, IconShieldLock, IconX, IconZoomCode } from '@tabler/icons-react'
import { DonutChart } from '@mantine/charts';
import { useAuthSWR } from '@/utils/useAuthSWR'
import OverviewChart from '@/components/Dashboard/OverviewChart';
import PerformanceBar from '@/components/Dashboard/PerformanceBar';
import HistoryChart from '@/components/Dashboard/HistoryChart';
import DetailsModal from '@/components/Dashboard/DetailsModal';

function Dashboard() {
  const [modal, setModal] = useState(null);
  const [performanceTab, setPerformanceTab] = useState('desktop');
  const { data = {}, error, isLoading } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const { data: flows = [], isLoading: isLoadingFlows } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/flows`)
  const { data: uptime = {}, isLoading: isLoadingUptime } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/uptime`)

  const { user, checks } = data

  if (isLoading || isLoadingFlows || !user || !checks.length) {
    return (
      <Layout title="Dashboard">
        <Title mb="xl" order={1} fw="normal">Dashboard</Title>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Layout>
    )
  }

  // todo empty & loading state?

  const spacing = { base: 'md', md: 'xl' }
  const recentPerformance = checks.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentFuzz = checks.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentHeaders = checks.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSSL = checks.filter(d => d.check === 'ssl').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]

  const openModal = (e, m) => {
    e.preventDefault()
    setModal(m)
  }

  return (
    <Layout title="Dashboard">
      <Title mb="xl" order={1} fw="normal">Dashboard</Title>

      <Box maw={1800} mx="auto">
        <Flex mb={spacing} gap={spacing}>
          <OverviewChart data={checks} flows={flows} />

          <SimpleGrid cols={3} spacing={spacing} w="75%">
            <Card withBorder shadow="md" style={{ overflow: 'visible' }}>
              <Flex gap="xs" align="center">
                <ThemeIcon variant="default" size="md">
                  <IconChartBar style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Title order={2} size="h4" fw="normal">Uptime</Title>
              </Flex>
              <Text size="xs" mb="lg">within the last {uptime.dateDiff} days</Text>

              {isLoadingUptime
                ? <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                : <Flex h="100%" direction="column" justify="center" align="center">
                  <DonutChart
                    h={100}
                    w={100}
                    withTooltip={false}
                    chartLabel={`${uptime.count / (uptime.count - uptime.failedCount) * 100}%`}
                    mx="auto"
                    data={[
                      { name: 'Uptime', value: uptime.count, color: 'green' },
                      { name: 'Downtime', value: uptime.failedCount, color: 'red' },
                    ]}
                  />
                </Flex>
              }
            </Card>
            <Card withBorder shadow="md">
              <Flex gap="xs" align="center">
                <ThemeIcon variant="default" size="md">
                  <IconShieldLock style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Title order={2} size="h4" fw="normal">Security</Title>
              </Flex>
              <Text size="xs" mb="lg">from {new Date(recentSSL.createdAt).toLocaleDateString()}</Text>

              <Flex direction="column" gap="md">
                <Flex gap="xs">
                  <ThemeIcon mt="5px" size="sm" color={recentSSL.result.status === 'success' ? 'green' : 'red'}>
                    {recentSSL.result.status === 'success'
                      ? <IconCheck style={{ width: '70%', height: '70%' }} />
                      : <IconX style={{ width: '70%', height: '70%' }} />
                    }
                  </ThemeIcon>
                  <Box>
                    <Text fw="normal">SSL Certificate</Text>
                    {recentSSL.result.status === 'success' &&
                      <Text size="xs" fa="right">Valid until {new Date(recentSSL.result.details.validTo).toLocaleDateString()}</Text>
                    }
                  </Box>
                </Flex>

                <Flex gap="xs">
                  <ThemeIcon mt="5px" size="sm" color={recentFuzz.result.status === 'success' ? 'green' : 'red'}>
                    {recentFuzz.result.status === 'success'
                      ? <IconCheck style={{ width: '70%', height: '70%' }} />
                      : <IconX style={{ width: '70%', height: '70%' }} />
                    }
                  </ThemeIcon>
                  <Box>
                    <Text fw="normal">Sensitive Files Check</Text>
                    {recentFuzz.result.details.files.length === 0 && <Text size="xs" fa="right">No exposed files found</Text>}
                    {recentFuzz.result.details.files.length > 0 && <Text size="xs" fa="right">
                      <a href="#open-modal" onClick={e => openModal(e, 'fuzz')}>
                        {recentFuzz.result.details.files.length} files found
                      </a>
                    </Text>}
                  </Box>
                </Flex>

                <Flex gap="xs">
                  <ThemeIcon mt="5px" size="sm" color={recentHeaders.result.status === 'success' ? 'green' : 'yellow'}>
                    {recentHeaders.result.status === 'success'
                      ? <IconCheck style={{ width: '70%', height: '70%' }} />
                      : <IconExclamationMark style={{ width: '70%', height: '70%' }} />
                    }
                  </ThemeIcon>
                  <Box>
                    <Text fw="normal">HTTP Headers</Text>
                    {recentHeaders.result.details.missingHeaders.length === 0 && <Text size="xs" fa="right">All security headers are set</Text>}
                    {recentHeaders.result.details.missingHeaders.length > 0 && <Text size="xs" fa="right">
                      <a href="#open-modal" onClick={e => openModal(e, 'headers')}>
                        {recentHeaders.result.details.missingHeaders.length} missing security headers
                      </a>
                    </Text>}
                  </Box>
                </Flex>
              </Flex>
            </Card>
            <Card withBorder shadow="md">
              <Flex justify="space-between">
                <Flex gap="xs" align="center" >
                  <ThemeIcon variant="default" size="md">
                    <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
                  </ThemeIcon>
                  <Title order={2} size="h4" fw="normal">Performance</Title>
                </Flex>
                <Flex gap="xs">
                  <ActionIcon variant={performanceTab === 'desktop' ? 'filled' : 'outline'} aria-label="Desktop" onClick={() => setPerformanceTab('desktop')}>
                    <IconDeviceDesktop style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                  <ActionIcon variant={performanceTab === 'mobile' ? 'filled' : 'outline'} aria-label="Mobile" onClick={() => setPerformanceTab('mobile')}>
                    <IconDeviceMobile style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                </Flex>
              </Flex>

              <Text size="xs" mb="md">from {new Date(recentPerformance.createdAt).toLocaleDateString()}</Text>

              {performanceTab === 'desktop' && <Box>
                <PerformanceBar title="Largest Contentful Paint" metric={recentPerformance.result.details.desktopResult.LCP} unit="ms" mb="sm" />
                <PerformanceBar title="Interaction to Next Paint" metric={recentPerformance.result.details.desktopResult.INP} unit="ms" mb="sm" />
                <PerformanceBar title="Cumulative Layout Shift" metric={recentPerformance.result.details.desktopResult.CLS} unit="ms" />
              </Box>}

              {performanceTab === 'mobile' && <Box>
                <PerformanceBar title="Largest Contentful Paint" metric={recentPerformance.result.details.mobileResult.LCP} unit="ms" mb="sm" />
                <PerformanceBar title="Interaction to Next Paint" metric={recentPerformance.result.details.mobileResult.INP} unit="ms" mb="sm" />
                <PerformanceBar title="Cumulative Layout Shift" metric={recentPerformance.result.details.mobileResult.CLS} unit="ms" />
              </Box>}
            </Card>
            <Card withBorder shadow="md">
              <Flex gap="xs" align="center" mb="lg" >
                <ThemeIcon variant="default" size="md">
                  <IconAccessible style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Title order={2} size="h4" fw="normal">Accessibility</Title>
              </Flex>
            </Card>
            <Card withBorder shadow="md">
              <Flex gap="xs" align="center" mb="lg">
                <ThemeIcon variant="default" size="md">
                  <IconZoomCode style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Title order={2} size="h4" fw="normal">SEO</Title>
              </Flex>
            </Card>
            <Card withBorder shadow="md">
              <Flex gap="xs" align="center" mb="lg" >
                <ThemeIcon variant="default" size="md">
                  <IconChartBar style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Title order={2} size="h4" fw="normal">Custom Flows</Title>
              </Flex>
            </Card>
          </SimpleGrid>
        </Flex>

        <Flex mb="md" gap={spacing}>
          <Card withBorder shadow="md" w="100%">
            <Title mb="md" order={2} size="h3" fw="normal">Status Checks</Title>

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconChartBar style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Uptime</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'uptime')} />
            </Box>

            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconShieldLock style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Security</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'fuzz')} />
            </Box>

            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconAccessible style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Accessibility</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'a11y')} />
            </Box>

            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconZoomCode style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">SEO</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'seo')} />
            </Box>


            <Divider my="sm" />

            <Box>
              <Flex gap="xs" align="center" mb="xs">
                <ThemeIcon variant="default" size="md">
                  <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Text size="sm">Performance</Text>
              </Flex>

              <HistoryChart data={checks.filter(d => d.check === 'performance')} />
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
                      .filter(Boolean)}
                  />
                </Box>

                {index !== flows.length - 1 && <Divider my="sm" />}
              </Box>
            ))}
          </Card>
        </Flex>
      </Box>
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

      <DetailsModal
        modal={modal}
        setModal={setModal}
        recentHeaders={recentHeaders}
        recentFuzz={recentFuzz}
        user={user}
      />
    </Layout>
  )
}

export default Dashboard
