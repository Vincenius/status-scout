import { Box, Button, Card, Divider, Flex, Text, ThemeIcon, Title } from '@mantine/core'
import { IconBrandSpeedtest, IconChartBar, IconShieldLock, IconZoomCode } from '@tabler/icons-react'
import { useMantineColorScheme } from '@mantine/core';
import HistoryChart from '@/components/Dashboard/HistoryChart';

function MockHistoryCharts() {
  const { colorScheme } = useMantineColorScheme();
  const backgroundColor =
    colorScheme === 'dark'
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(255, 255, 255, 0.5)';
  return (
    <Flex mb="md" gap="md" direction={{ base: 'column', md: 'row' }} style={{ position: 'relative ' }} my="xl">
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: backgroundColor,
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 1,
          borderRadius: 'calc(0.25rem * 1)'
        }}
      >
        <Flex justify="center" align="center" h="100%" direction="column" gap="md" p="md">
          <Title order={2} size="h1" fw="normal" ta="center">Monitoring is coming soon...</Title>
          <Button size="lg">Join the Waitlist</Button>
          {/* todo modal with brevo signup */}
        </Flex>
      </Box>


      <Card withBorder shadow="md" w="100%">
        <Box>
          <Flex gap="xs" align="center" mb="xs">
            <ThemeIcon variant="default" size="md">
              <IconChartBar style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text size="sm">Uptime</Text>
          </Flex>

          <HistoryChart data={[{ result: { status: 'success' } }]} />
        </Box>

        <Divider my="sm" />

        <Box>
          <Flex gap="xs" align="center" mb="xs">
            <ThemeIcon variant="default" size="md">
              <IconShieldLock style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text size="sm">Security</Text>
          </Flex>

          <HistoryChart data={[{ result: { status: 'success' } }]} />
        </Box>
      </Card>

      <Card withBorder shadow="md" w="100%">
        <Box>
          <Flex gap="xs" align="center" mb="xs">
            <ThemeIcon variant="default" size="md">
              <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text size="sm">Performance</Text>
          </Flex>

          <HistoryChart data={[{ result: { status: 'success' } }]} />
        </Box>

        <Divider my="sm" />

        <Box>
          <Flex gap="xs" align="center" mb="xs">
            <ThemeIcon variant="default" size="md">
              <IconZoomCode style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text size="sm">SEO</Text>
          </Flex>

          <HistoryChart data={[{ result: { status: 'success' } }]} />
        </Box>
      </Card>
    </Flex>
  )
}

export default MockHistoryCharts
