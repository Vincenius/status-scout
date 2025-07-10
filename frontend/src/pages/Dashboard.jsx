import Layout from '@/components/Layout/Layout'
import { Box, Card, Flex, SimpleGrid, Table, Text, ThemeIcon, Title, Tooltip } from '@mantine/core'
import { IconAccessible, IconChartBar, IconCode, IconShieldLock } from '@tabler/icons-react'

const mockData = {
  status: [{
    time: '2023-02-11 12:34:56',
    failed: [],
  }, {
    time: '2023-02-11 13:34:56',
    failed: []
  }, {
    time: '2023-02-11 14:34:56',
    failed: ['security']
  }, {
    time: '2023-02-11 15:34:56',
    failed: []
  }],
  logs: [{
    time: '2023-02-11 15:34:56',
    status: 'fix',
    message: 'All issues have been resolved'
  }, {
    time: '2023-02-11 14:34:56',
    status: 'fail',
    message: 'Security Check Failed: package.json file exposed to public'
  }]
}

const Chart = ({ type }) => {
  return (
    <Flex gap="2px">
      {
        mockData.status.map((item, index) => (
          <Tooltip key={index} label={new Date(item.time).toLocaleString()}>
            <Card h={20} w={2} bg={!item.failed.includes(type) ? 'green' : 'red'}></Card>
          </Tooltip>
        ))
      }
    </Flex>
  )
}

function Dashboard() {
  return (
    <Layout title="Dashboard">
      <Title mb="xl" order={1} fw="normal">Dashboard</Title>

      <Box mb="xl">
        {/* todo time filter */}
        <Flex mb="xs" gap="3px">
          {mockData.status.map((item, index) => (
            <Tooltip key={index} label={new Date(item.time).toLocaleString()}>
              <Card h={100} w={10} bg={item.failed.length === 0 ? 'green' : 'red'}></Card>
            </Tooltip>
          ))}
        </Flex>
      </Box>

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
                <Table.Td><Chart type="uptime" /></Table.Td>
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
                <Table.Td><Chart type="security" /></Table.Td>
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
                <Table.Td><Chart type="a11y" /></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <ThemeIcon variant="default" size="sm">
                      <IconCode style={{ width: '70%', height: '70%' }} />
                    </ThemeIcon>
                    <Text>Embedded</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart type="embedded" /></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Card>
        <Card withBorder shadow="md">
          <Title mb="md" order={2} size="h4" fw="normal">Custom Tests</Title>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <Text>Signup Flow</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart type="signupFlow" /></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <Flex gap="xs" align="center">
                    <Text>robots.txt set correctly</Text>
                  </Flex>
                </Table.Td>
                <Table.Td><Chart type="robots" /></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Card>
      </SimpleGrid>
      <Card withBorder shadow="md">
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
      </Card>
    </Layout>
  )
}

export default Dashboard
