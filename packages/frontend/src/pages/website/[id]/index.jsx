import Layout from '@/components/Layout/Layout';
import { Card, Container, Flex, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { useAuthSWR } from '@/utils/useAuthSWR'
import { IconAlertSquareRounded, IconChartBar } from '@tabler/icons-react';
import HistoryChart from '@/components/Dashboard/HistoryChart';
import { useParams } from 'react-router-dom';
import { getIssueHistory, getNotificationMessage } from '@statusscout/shared'
import { Link } from 'react-router-dom';
import Website404 from '@/components/Website/Website404';

function WebsiteOverview() {
  const { id } = useParams();
  const { data: websites = [], isLoading: isLoadingWebsites } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const website = websites.find(w => w.index === id)
  const { data = {} } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/history?id=${website?.id || ''}`)
  const { uptime = [], checks = [], initialCheckDate } = data
  const issues = getIssueHistory(checks)
  const sortedIssues = issues.sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))

  if (!isLoadingWebsites && !website) {
    return (
      <Website404 />
    )
  }

  return (
    <Layout title="Website Overview">
      <Container size="md" py="md" px={{ base: "0", md: "md" }}>
        <Title size="h1" ta="center" mb="sm">Overview</Title>

        <Card withBorder my="md">
          <Flex gap="xs" align="center" mb="md">
            <ThemeIcon variant="default" size="md">
              <IconChartBar style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text>Uptime</Text>
          </Flex>

          <HistoryChart
            data={uptime.sort((d1, d2) => new Date(d1.createdAt) - new Date(d2.createdAt))}
            getLabel={item => {
              const ping = item?.result?.details?.responseTimeMs
              return ping ? `Ping: ${ping}ms` : ''
            }}
          />
        </Card>

        <Card withBorder my="md">
          <Flex gap="xs" align="center" mb="md">
            <ThemeIcon variant="default" size="md">
              <IconAlertSquareRounded style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text>Issues</Text>
          </Flex>

          <HistoryChart
            data={sortedIssues}
            getLabel={item => {
              const count = item?.issues?.length || 0
              return count ? `${count} new issues detected` : 'no new issues detected'
            }}
          />

          <Text mt="xl">Recent Issue History</Text>
          <Table striped withTableBorder mt="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Td>Report from</Table.Td>
                <Table.Td>Details</Table.Td>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedIssues
                .filter(i => i.createdAt !== initialCheckDate)
                .reverse().map((item, index) => item.issues.filter(i => !i.resolvedAt).map((issue, i) => (
                  <Table.Tr key={`issues-${index}-${i}`}>
                    <Table.Td>{i === 0 ? <Link to={`/website/${website.index}/report?j_id=${item.jobId}`}>{new Date(item.createdAt).toLocaleString()}</Link> : ''}</Table.Td>
                    <Table.Td>{getNotificationMessage({ type: issue.check, details: issue.title })}</Table.Td>
                  </Table.Tr>
                )))}
            </Table.Tbody>
          </Table>
        </Card>
      </Container>
    </Layout>
  );
}

export default WebsiteOverview;
