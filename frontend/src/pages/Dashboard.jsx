import { useState } from 'react';
import Layout from '@/components/Layout/Layout'
import { Box, Card, Flex, SimpleGrid, Text, ThemeIcon, Title, LoadingOverlay, Divider, ActionIcon, Avatar } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconCheck, IconDeviceDesktop, IconDeviceMobile, IconExclamationMark, IconGlobe, IconInfoCircle, IconInfoSmall, IconListCheck, IconShieldLock, IconWorld, IconX, IconZoomCode } from '@tabler/icons-react'
import { useAuthSWR } from '@/utils/useAuthSWR'
import OverviewChart from '@/components/Dashboard/OverviewChart';
import PerformanceBar from '@/components/Dashboard/PerformanceBar';
import HistoryChart from '@/components/Dashboard/HistoryChart';
import DetailsModal from '@/components/Dashboard/DetailsModal';
import calcScore from '@/utils/calcScore'
// import { linkMock } from '@/utils/mockData'

function Dashboard() {
  const [modal, setModal] = useState(null);
  const [performanceTab, setPerformanceTab] = useState('desktop');
  const { data = {}, error, isLoading } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const { data: flows = [], isLoading: isLoadingFlows } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/flows`)
  const { data: uptime = {}, isLoading: isLoadingUptime } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user/uptime`)

  const { user, checks } = data

  if (isLoading || isLoadingFlows || !user || !checks.length) {
    return (
      <Layout title="Dashboard">
        <Title mb="xl" order={1} fw="normal">Dashboard</Title>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Layout>
    )
  }

  const { ignore = [] } = user

  // todo empty & loading & error state?

  const spacing = { base: 'md', md: 'xl' }
  const url = data.user.domain && new URL(data.user.domain);
  const recentCheck = checks.sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentPerformance = checks.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentFuzz = checks.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentHeaders = checks.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSSL = checks.filter(d => d.check === 'ssl').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentA11y = checks.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSeo = checks.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentLinks = checks.filter(d => d.check === 'links').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentCustomChecks = checks.filter(d => d.check === 'custom').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const brokenLinks = recentLinks.result.details.filter(link => !ignore.filter(i => i.type === 'links').map(i => i.item).includes(link.url))

  const linkScore = calcScore(brokenLinks.length, 20)
  const seoScore = Math.max(Math.round(recentSeo.result.details.score * 0.9 + linkScore * 0.1), 0);

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

  const customScore = (flows.length > 0 && recentCustomChecks?.result.length > 0)
    ? recentCustomChecks.result
      .map(r => r.result.status === 'success' ? 100 : 0)
      .reduce((p, c) => p + c, 0) / recentCustomChecks.result.length
    : null

  const openModal = (e, m) => {
    e.preventDefault()
    setModal(m)
  }

  const triggerCheck = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/v1/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({}),
    }).then(res => console.log(res))
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
                  <IconInfoCircle style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Title order={2} size="h4" fw="normal">Overview</Title>
              </Flex>
              <Text size="xs" mb="lg">Last check: {new Date(recentCheck.createdAt).toLocaleString()}</Text>

              <Flex gap="xs" mb="md">
                <ThemeIcon mt="5px" size="md" variant="light">
                  <IconWorld style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Box>
                  <Text fw="normal" size="sm">
                    Website:
                  </Text>
                  <Text size="sm">
                    <a href={data.user.domain} target="_blank" rel="noopener noreferrer">
                      {url?.host}
                    </a>
                  </Text>
                </Box>
              </Flex>

              <Flex gap="xs" mb="sm">
                <ThemeIcon mt="5px" size="md" variant="light">
                  <IconChartBar style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Box>
                  <Text fw="normal" size="sm">
                    Uptime:
                  </Text>
                  <Text size="sm">
                    {(uptime.count / (uptime.count - uptime.failedCount) * 100).toFixed(0)}% within the last {uptime.dateDiff} days
                  </Text>
                </Box>
              </Flex>

              {/* todo */}
              {/* <Text ta="center" mt="md">
                <a href="#trigger-check" onClick={triggerCheck}>trigger new check</a>
              </Text> */}
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
              <Flex justify="space-between">
                <Box>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="md">
                      <IconZoomCode style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>

                    <Title order={2} size="h4" fw="normal">SEO</Title>
                  </Flex>
                  <Text size="xs" mb="lg">from {new Date(recentSeo.createdAt).toLocaleDateString()}</Text>
                </Box>

                <Avatar
                  radius="xl"
                  color={seoScore > 90 ? 'green' : seoScore > 50 ? 'yellow' : 'red'}
                >
                  {seoScore}
                </Avatar>
              </Flex>

              <Flex gap="xs" align="center" mb="md">
                <ThemeIcon size="sm" color={recentSeo.result.details.items.length === 0 ? 'green' : 'yellow'}>
                  {recentSeo.result.details.items.length === 0
                    ? <IconCheck style={{ width: '70%', height: '70%' }} />
                    : <IconExclamationMark style={{ width: '70%', height: '70%' }} />
                  }
                </ThemeIcon>
                <Box>
                  {recentSeo.result.details.items.length === 0 && <Text fa="right">No SEO issues found</Text>}
                  {recentSeo.result.details.items.length > 0 && <Text fa="right">
                    <a href="#open-modal" onClick={e => openModal(e, 'seo')}>
                      {recentSeo.result.details.items.length} SEO {recentSeo.result.details.items.length === 1 ? 'issue' : 'issues'} found
                    </a>
                  </Text>}
                </Box>
              </Flex>

              <Flex gap="xs" align="center">
                <ThemeIcon size="sm" color={brokenLinks.length === 0 ? 'green' : 'yellow'}>
                  {brokenLinks.length === 0
                    ? <IconCheck style={{ width: '70%', height: '70%' }} />
                    : <IconExclamationMark style={{ width: '70%', height: '70%' }} />
                  }
                </ThemeIcon>
                <Box>
                  {brokenLinks.length === 0 && <Text fa="right">No broken links found</Text>}
                  {brokenLinks.length > 0 && <Text fa="right">
                    <a href="#open-modal" onClick={e => openModal(e, 'links')}>
                      {brokenLinks.length} broken {brokenLinks.length === 1 ? 'link' : 'links'} found
                    </a>
                  </Text>}
                </Box>
              </Flex>
            </Card>

            <Card withBorder shadow="md">
              <Flex justify="space-between">
                <Box>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="md">
                      <IconAccessible style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>

                    <Title order={2} size="h4" fw="normal">Accessibility</Title>
                  </Flex>
                  <Text size="xs" mb="lg">from {new Date(recentA11y.createdAt).toLocaleDateString()}</Text>
                </Box>

                <Avatar
                  radius="xl"
                  color={recentA11y.result.details.score > 90 ? 'green' : recentA11y.result.details.score > 50 ? 'yellow' : 'red'}
                >
                  {recentA11y.result.details.score}
                </Avatar>
              </Flex>

              <Flex gap="xs" align="center">
                <ThemeIcon size="sm" color={recentA11y.result.details.items.length === 0 ? 'green' : 'yellow'}>
                  {recentA11y.result.details.items.length === 0
                    ? <IconCheck style={{ width: '70%', height: '70%' }} />
                    : <IconExclamationMark style={{ width: '70%', height: '70%' }} />
                  }
                </ThemeIcon>
                <Box>
                  {recentA11y.result.details.items.length === 0 && <Text fa="right">No accessibility violations found</Text>}
                  {recentA11y.result.details.items.length > 0 && <Text fa="right">
                    <a href="#open-modal" onClick={e => openModal(e, 'a11y')}>
                      {recentA11y.result.details.items.length} accessibility {recentA11y.result.details.items.length === 1 ? 'violation' : 'violations'} found
                    </a>
                  </Text>}
                </Box>
              </Flex>
            </Card>

            <Card withBorder shadow="md">
              <Flex justify="space-between">
                <Box>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="md">
                      <IconChartBar style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>

                    <Title order={2} size="h4" fw="normal">Custom Flows</Title>
                  </Flex>
                  <Text size="xs" mb="lg">from {new Date(recentCustomChecks.createdAt).toLocaleDateString()}</Text>
                </Box>

                <Avatar
                  radius="xl"
                  color={customScore === 100 ? 'green' : customScore > 75 ? 'yellow' : 'red'}
                >
                  {customScore}
                </Avatar>
              </Flex>

              <Flex gap="xs" align="center">
                <ThemeIcon size="sm" color={customScore === 100 ? 'green' : 'yellow'}>
                  {customScore === 100
                    ? <IconCheck style={{ width: '70%', height: '70%' }} />
                    : <IconExclamationMark style={{ width: '70%', height: '70%' }} />
                  }
                </ThemeIcon>
                <Box>
                  {customScore === 100 && <Text fa="right">Passed all custom checks</Text>}
                  {customScore !== 100 && <Text fa="right">
                    Passed {recentCustomChecks.result.filter(r => r.result.status === 'success').length} of {recentCustomChecks.result.length} checks<br />
                    <a href="#open-modal" onClick={e => openModal(e, 'custom')}>
                      Show details
                    </a>
                  </Text>}
                </Box>
              </Flex>
            </Card>
          </SimpleGrid>
        </Flex >

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
      </Box >

      <DetailsModal
        modal={modal}
        setModal={setModal}
        recentHeaders={recentHeaders}
        recentFuzz={recentFuzz}
        recentA11y={recentA11y}
        recentSeo={recentSeo}
        recentLinks={recentLinks}
        user={user}
      />
    </Layout >
  )
}

export default Dashboard
