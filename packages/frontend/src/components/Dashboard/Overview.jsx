import { useState } from 'react';
import Layout from '@/components/Layout/Layout'
import { Box, Card, Flex, Text, ThemeIcon, Title, LoadingOverlay, ActionIcon, Avatar, Grid, Button, Blockquote, Loader, Skeleton, Divider, Space } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconCheck, IconClock, IconClockFilled, IconDeviceDesktop, IconDeviceMobile, IconExclamationMark, IconInfoCircle, IconMessage, IconShieldLock, IconWorld, IconX, IconZoomCode } from '@tabler/icons-react'
import OverviewChart from '@/components/Dashboard/OverviewChart';
import PerformanceBar from '@/components/Dashboard/PerformanceBar';
import DetailsModal from '@/components/Dashboard/DetailsModal';
import calcScore from '@/utils/calcScore'
import FeedbackButton from '@/components/FeedbackButton/FeedbackButton';
import InfoPopover from '@/components/InfoPopover/InfoPopover';

const LoadingInfoBox = ({ title }) => {
  return (
    <Flex gap="xs">
      <Skeleton mt="5px" height={22} radius="xs" w={22} animate={false} />
      <Box>
        <Text fw="normal">{title}</Text>
        <Skeleton height={8} radius="xl" w={150} />
      </Box>
    </Flex>
  )
}

const InfoBox = ({ success, title, hint, children }) => {
  return (<Flex gap="xs">
    <ThemeIcon mt="5px" size="sm" color={success ? 'green' : 'yellow'}>
      {success
        ? <IconCheck style={{ width: '70%', height: '70%' }} />
        : <IconExclamationMark style={{ width: '70%', height: '70%' }} />
      }
    </ThemeIcon>
    <Box>
      <Flex gap="xs" align="center">
        <Text fw="normal">{title}</Text>
        {hint && <InfoPopover infoText={hint} />}
      </Flex>
      {children}
    </Box>
  </Flex>)
}

function Overview({ data, isLoading, flows = [], uptime, isQuickCheck, hasFailed }) {
  const [modal, setModal] = useState(null);
  const [performanceTab, setPerformanceTab] = useState('desktop');

  const { user, checks = [], createdAt, allChecksCompleted } = data

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <Title mb="xl" order={1} fw="normal">Dashboard</Title>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Layout>
    )
  }

  const { ignore = [] } = user

  const spacing = { base: 'md', md: 'md' }
  const grid = { base: 12, md: 12, xl: 4 }
  const url = data.user.domain && new URL(data.user.domain);
  const dateString = new Date(createdAt).toLocaleString();
  const recentPerformance = checks.filter(d => d.check === 'performance').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentFuzz = checks.filter(d => d.check === 'fuzz').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentHeaders = checks.filter(d => d.check === 'headers').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSSL = checks.filter(d => d.check === 'ssl').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentA11y = checks.filter(d => d.check === 'a11y').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentSeo = checks.filter(d => d.check === 'seo').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentLinks = checks.filter(d => d.check === 'links').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const recentCustomChecks = checks.filter(d => d.check === 'custom').sort((d1, d2) => new Date(d2.createdAt) - new Date(d1.createdAt))[0]
  const brokenLinks = recentLinks && recentLinks.result.details.filter(link => !ignore.filter(i => i.type === 'links').map(i => i.item).includes(link.url))

  const linkScore = brokenLinks && calcScore(brokenLinks.length, 20)
  const seoScore = recentSeo && recentLinks && Math.max(Math.round(recentSeo.result.details.score * 0.9 + linkScore * 0.1), 0);

  const customScore = (flows.length > 0 && recentCustomChecks?.result.length > 0)
    ? recentCustomChecks.result
      .map(r => r.result.status === 'success' ? 100 : 0)
      .reduce((p, c) => p + c, 0) / recentCustomChecks.result.length
    : null

  const openModal = (e, m) => {
    e.preventDefault()
    setModal(m)
  }

  return (
    <>
      <Grid cols={4} gutter={spacing} mb={spacing} h={{ base: '100%', md: 'auto' }}>
        <Grid.Col span={grid}>
          <Flex gap={spacing} h="100%" direction={{ base: 'column', md: 'row', xl: 'column' }}>
            <Card withBorder shadow="md">
              <Box mb="lg">
                <Flex gap="xs" align="center">
                  <ThemeIcon variant="default" size="md">
                    <IconInfoCircle style={{ width: '70%', height: '70%' }} />
                  </ThemeIcon>
                  <Title order={2} size="h4" fw="normal">Overview</Title>
                </Flex>
                {!isQuickCheck && <Text size="xs">Last check: {dateString}</Text>}
              </Box>

              {isQuickCheck && <Flex gap="xs" mb="md">
                <ThemeIcon mt="5px" size="md" variant="light">
                  <IconClockFilled style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Box>
                  <Text fw="normal" size="sm">
                    Checked at:
                  </Text>
                  <Text size="sm">
                    {dateString}
                  </Text>
                </Box>
              </Flex>}

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

              {!isQuickCheck && <Flex gap="xs" mb="sm">
                <ThemeIcon mt="5px" size="md" variant="light">
                  <IconChartBar style={{ width: '70%', height: '70%' }} />
                </ThemeIcon>
                <Box>
                  <Text fw="normal" size="sm">
                    Uptime:
                  </Text>
                  <Text size="sm">
                    {((uptime.count - uptime.failedCount) / uptime.count * 100).toFixed(0)}% within the last {uptime.dateDiff} days
                  </Text>
                </Box>
              </Flex>}
            </Card>

            <Card withBorder shadow="md" p="0" flex="1">
              <Flex h="100%" align="center" justify="center">
                {allChecksCompleted && <OverviewChart data={checks} flows={flows} />}
                {!allChecksCompleted && !hasFailed && <Loader size="xl" p="md" />}
                {!allChecksCompleted && hasFailed && <Blockquote p="xs" color="red" maw={400} mx="auto">
                  An unexpected error occurred. Please try again or contact me: <a href="mailto:hello@statusscout.dev">hello@statusscout.dev</a>
                </Blockquote>}
              </Flex>
            </Card>
          </Flex>
        </Grid.Col>

        <Grid.Col span={grid} h={{ base: '100%', md: 'auto' }}>
          <Flex gap={spacing} direction={{ base: 'column', md: 'row', xl: 'column' }} h="100%">
            <Card withBorder shadow="md" flex="1">
              <Box mb="lg">
                <Flex gap="xs" align="center">
                  <ThemeIcon variant="default" size="md">
                    <IconShieldLock style={{ width: '70%', height: '70%' }} />
                  </ThemeIcon>
                  <Title order={2} size="h4" fw="normal">Security</Title>
                </Flex>
                {!isQuickCheck && <Text size="xs">from {new Date(recentSSL.createdAt).toLocaleDateString()}</Text>}
              </Box>

              <Flex direction="column" gap="md">
                {!recentSSL && <LoadingInfoBox title="SSL Certificate" />}
                {recentSSL && <InfoBox success={recentSSL.result.status === 'success'} title="SSL Certificate">
                  <Text size="xs" fa="right">Valid until {new Date(recentSSL.result.details.validTo).toLocaleDateString()}</Text>
                </InfoBox>}

                {!recentFuzz && <LoadingInfoBox title="Sensitive Files Check" />}
                {recentFuzz && <InfoBox
                  success={recentFuzz.result.status === 'success'}
                  title="Sensitive Files Check"
                  hint="Note: For performance reasons, only the 140 most common sensitive files are checked. This does not cover all possible files."
                >
                  {recentFuzz.result.details.files.length === 0 && <Text size="xs" fa="right">No exposed files found</Text>}
                  {recentFuzz.result.details.files.length > 0 && <Text size="xs" fa="right">
                    <a href="#open-modal" onClick={e => openModal(e, 'fuzz')}>
                      {recentFuzz.result.details.files.length} files found
                    </a>
                  </Text>}
                </InfoBox>}

                {!recentHeaders && <LoadingInfoBox title="HTTP Headers" />}
                {recentHeaders && <InfoBox success={recentHeaders.result.details.missingHeaders.length === 0} title="HTTP Headers">
                  {recentHeaders.result.details.missingHeaders.length === 0 && <Text size="xs" fa="right">All security headers are set</Text>}
                  {recentHeaders.result.details.missingHeaders.length > 0 && <Text size="xs" fa="right">
                    <a href="#open-modal" onClick={e => openModal(e, 'headers')}>
                      {recentHeaders.result.details.missingHeaders.length} missing security headers
                    </a>
                  </Text>}
                </InfoBox>}
              </Flex>
            </Card>

            <Card withBorder shadow="md" flex="1">
              <Box mb="lg">
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
                {!isQuickCheck && <Text size="xs">from {new Date(recentPerformance.createdAt).toLocaleDateString()}</Text>}
              </Box>

              {performanceTab === 'desktop' && <Box>
                <PerformanceBar title="Largest Contentful Paint" isLoading={!recentPerformance} metric={recentPerformance?.result?.details?.desktopResult?.LCP} unit="ms" mb="sm" />
                <PerformanceBar title="Interaction to Next Paint" isLoading={!recentPerformance} metric={recentPerformance?.result?.details?.desktopResult?.INP} unit="ms" mb="sm" />
                <PerformanceBar title="Cumulative Layout Shift" isLoading={!recentPerformance} metric={recentPerformance?.result?.details?.desktopResult?.CLS} unit="ms" />
              </Box>}

              {performanceTab === 'mobile' && <Box>
                <PerformanceBar title="Largest Contentful Paint" isLoading={!recentPerformance} metric={recentPerformance?.result?.details?.mobileResult?.LCP} unit="ms" mb="sm" />
                <PerformanceBar title="Interaction to Next Paint" isLoading={!recentPerformance} metric={recentPerformance?.result?.details?.mobileResult?.INP} unit="ms" mb="sm" />
                <PerformanceBar title="Cumulative Layout Shift" isLoading={!recentPerformance} metric={recentPerformance?.result?.details?.mobileResult?.CLS} unit="ms" />
              </Box>}
            </Card>
          </Flex>
        </Grid.Col>

        <Grid.Col span={grid} h={{ base: '100%', md: 'auto' }}>
          <Flex gap={spacing} direction={{ base: 'column', md: 'row', xl: 'column' }} h="100%">
            <Card withBorder shadow="md" flex="1">
              <Flex justify="space-between">
                <Box mb="lg">
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="md">
                      <IconZoomCode style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>

                    <Title order={2} size="h4" fw="normal">SEO</Title>
                  </Flex>
                  {!isQuickCheck && <Text size="xs">from {new Date(recentSeo.createdAt).toLocaleDateString()}</Text>}
                </Box>

                {(!recentSeo || !recentLinks) && <Skeleton radius="xl" w={38} h={38} animate={false} />}
                {recentSeo && recentLinks && <Avatar
                  radius="xl"
                  color={seoScore > 90 ? 'green' : seoScore > 50 ? 'yellow' : 'red'}
                >
                  {seoScore}
                </Avatar>}
              </Flex>

              {!recentSeo && <LoadingInfoBox title="Lighthouse SEO" />}
              {recentSeo && <InfoBox success={recentSeo.result.details.items.length === 0} title="Lighthouse SEO">
                {recentSeo.result.details.items.length === 0 && <Text fa="right" size="xs">No SEO issues found</Text>}
                {recentSeo.result.details.items.length > 0 && <Text size="xs" fa="right">
                  <a href="#open-modal" onClick={e => openModal(e, 'seo')}>
                    {recentSeo.result.details.items.length} SEO {recentSeo.result.details.items.length === 1 ? 'issue' : 'issues'} found
                  </a>
                </Text>}
              </InfoBox>}

              <Space h="md" />

              {!recentLinks && <LoadingInfoBox title="Broken Links" />}
              {recentLinks && <InfoBox
                success={brokenLinks.length === 0}
                title="Broken Links"
                hint="Note: For performance reasons, only up to 200 links are checked for now. This does not cover all links on the site."
              >
                {brokenLinks.length === 0 && <Text fa="right" size="xs">No broken links found</Text>}
                {brokenLinks.length > 0 && <Text fa="right" size="xs">
                  <a href="#open-modal" onClick={e => openModal(e, 'links')}>
                    {brokenLinks.length} broken {brokenLinks.length === 1 ? 'link' : 'links'} found
                  </a>
                </Text>}
              </InfoBox>}
            </Card>

            <Card withBorder shadow="md" flex="1" mah={{ base: 'auto', xl: '24%' }}>
              <Flex justify="space-between">
                <Box mb="lg">
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="md">
                      <IconAccessible style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>

                    <Title order={2} size="h4" fw="normal">Accessibility</Title>
                  </Flex>
                  {!isQuickCheck && <Text size="xs">from {new Date(recentA11y.createdAt).toLocaleDateString()}</Text>}
                </Box>

                {!recentA11y && <Skeleton radius="xl" w={38} h={38} animate={false} />}
                {recentA11y && <Avatar
                  radius="xl"
                  color={recentA11y.result.details.score > 90 ? 'green' : recentA11y.result.details.score > 50 ? 'yellow' : 'red'}
                >
                  {Math.round(recentA11y.result.details.score)}
                </Avatar>}
              </Flex>

              {!recentA11y && <LoadingInfoBox title="Lighthouse Accessibility" />}
              {recentA11y && <InfoBox success={recentA11y.result.details.items.length === 0} title="Lighthouse Accessibility">
                {recentA11y.result.details.items.length === 0 && <Text fa="right" size="xs">No accessibility violations found</Text>}
                {recentA11y.result.details.items.length > 0 && <Text fa="right" size="xs">
                  <a href="#open-modal" onClick={e => openModal(e, 'a11y')}>
                    {recentA11y.result.details.items.length} accessibility {recentA11y.result.details.items.length === 1 ? 'violation' : 'violations'} found
                  </a>
                </Text>}
              </InfoBox>}
            </Card>

            {isQuickCheck && <Card withBorder shadow="md" flex="1">
              <Flex justify="space-between">
                <Box w="100%">
                  <Flex justify="space-between" gap="sm">
                    <Flex gap="xs" align="center" mb="md">
                      <ThemeIcon variant="default" size="md">
                        <IconMessage style={{ width: '70%', height: '70%' }} />
                      </ThemeIcon>

                      <Title order={2} size="h4" fw="normal">Any Suggestions?</Title>
                    </Flex>
                    <FeedbackButton size="xs">Send Feedback</FeedbackButton>
                  </Flex>


                  <Blockquote w="100%" p="xs">Spotted a bug, something missing, or have a suggestion?<br />Let me know!</Blockquote>
                </Box>
              </Flex>
            </Card>}

            {!isQuickCheck && <Card withBorder shadow="md" flex="1">
              <Flex justify="space-between">
                <Box mb="lg">
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="md">
                      <IconChartBar style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>

                    <Title order={2} size="h4" fw="normal">Custom Flows</Title>
                  </Flex>
                  <Text size="xs">from {new Date(recentCustomChecks.createdAt).toLocaleDateString()}</Text>
                </Box>

                <Avatar
                  radius="xl"
                  color={customScore === 100 ? 'green' : customScore > 75 ? 'yellow' : 'red'}
                >
                  {Math.round(customScore)}
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
            </Card>}
          </Flex>
        </Grid.Col>
      </Grid>

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
    </>
  )
}

export default Overview
