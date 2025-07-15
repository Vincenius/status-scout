import Layout from '@/components/Layout/Layout'
import useSWR from 'swr'
import { Box, Card, Flex, SimpleGrid, Table, Text, ThemeIcon, Title, Tooltip, LoadingOverlay } from '@mantine/core'
import { IconAccessible, IconBrandSpeedtest, IconChartBar, IconShieldLock, IconZoomCode } from '@tabler/icons-react'
import fetcher from '@/utils/fetcher'

const Chart = ({ data = [] }) => {
  console.log(data)
  return (
    <Flex gap="2px">
      {data.length < 30 ? Array.from({ length: 30 - data.length }).map((_, index) => (
        <Card key={index} h={20} w={10} p="0" bg="white" withBorder></Card>
      )) : <></>}
      {
        data.map((item, index) => (
          <Tooltip key={index} label={new Date(item.createdAt).toLocaleString()}>
            <Card h={20} w={10} p="0" bg={item.result.status === 'success' ? 'green' : 'red'}></Card>
          </Tooltip>
        ))
      }
    </Flex>
  )
}

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

  console.log(data, flows)

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
        <Card withBorder shadow="md">
          <Title mb="md" order={2} size="h4" fw="normal">Status Checks</Title>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="sm">
                      <IconChartBar style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text>Uptime</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart data={data.filter(d => d.check === 'uptime')} /></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="sm">
                      <IconShieldLock style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text>Security</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart data={data.filter(d => d.check === 'fuzz')} /></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="sm">
                      <IconAccessible style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text>Accessibility</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart data={data.filter(d => d.check === 'a11y')} /></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="sm">
                      <IconZoomCode style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text>SEO</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart data={data.filter(d => d.check === 'seo')} /></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="sm">
                      <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text>Performance</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart data={data.filter(d => d.check === 'performance')} /></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Card>
        <Card withBorder shadow="md">
          <Title mb="md" order={2} size="h4" fw="normal">Custom Flows</Title>
          <Table>
            <Table.Tbody>
              {flows.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Flex gap="xs" align="center">
                      <Text>{item.name}</Text>
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <Chart data={data.filter(d => d.check === 'custom').map(c => c.result.find(r => r.name === item.name))} />
                  </Table.Td>
                </Table.Tr>
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
