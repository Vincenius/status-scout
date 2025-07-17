import Layout from '@/components/Layout/Layout'
import useSWR from 'swr'
import { Box, Card, Flex, SimpleGrid, Table, Text, ThemeIcon, Title, Tooltip, LoadingOverlay, Divider } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconListCheck, IconShieldLock, IconZoomCode } from '@tabler/icons-react'
import fetcher from '@/utils/fetcher'
import { useMediaQuery } from '@mantine/hooks'

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

  console.log(visibleCount)

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
            bg="white"
            withBorder
          />
        )
      )}
    </SimpleGrid>
  );
};

function Dashboard() {
  const { data = [], error, isLoading } = useSWR(`${import.meta.env.VITE_API_URL}/v1/user`, fetcher)
  const { data: flows = [], isLoading: isLoadingFlows } = useSWR(`${import.meta.env.VITE_API_URL}/v1/flows`, fetcher)

  if (isLoading || isLoadingFlows) {
    return (
      <Layout title="Dashboard">
        <Title mb="xl" order={1} fw="normal">Dashboard</Title>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Layout>
    )
  }

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

      <SimpleGrid cols={{ xs: 1, sm: 2 }} mb="md">
        <Card withBorder shadow="md" maw={720}>
          <Title mb="md" order={2} size="h4" fw="normal">Status Checks</Title>

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="white" size="md">
                <IconChartBar style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Uptime</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'uptime')} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="white" size="md">
                <IconShieldLock style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Security</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'fuzz')} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="white" size="md">
                <IconAccessible style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Accessibility</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'a11y')} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="white" size="md">
                <IconZoomCode style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">SEO</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'seo')} />
          </Box>


          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="white" size="md">
                <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Performance</Text>
            </Flex>

            <Chart data={data.filter(d => d.check === 'performance')} />
          </Box>
        </Card>
        <Card withBorder shadow="md" maw={720}>
          <Title mb="md" order={2} size="h4" fw="normal">Custom Flows</Title>
          <Table>
            <Table.Tbody>
              {flows.map((item, index) => (
                <Box key={index}>
                  <Box>
                    <Flex gap="xs" align="center" mb="xs">
                      <ThemeIcon variant="white" size="md">
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
            </Table.Tbody>
          </Table>
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
