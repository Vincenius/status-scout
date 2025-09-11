import Layout from '@/components/Layout/Layout'
import { Box, Card, Flex, Title, LoadingOverlay } from '@mantine/core'
import { useAuthSWR } from '@/utils/useAuthSWR'
import { Link } from 'react-router-dom'
// import { linkMock } from '@/utils/mockData'

// TODO overview of websites

function Dashboard() {
  const { data: websites = [], isLoading } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)

  // todo move to overview?
  if (isLoading) {
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

      <Box maw={1800} mx="auto">
        <Title order={2} mb="md" fw="normal">Your Websites:</Title>
        <Flex gap="md" direction="row" wrap="wrap" justify="space-between" mb="md">
          {websites.map(website => (
            // todo change link to overview instead of report
            <Link key={website.domain} to={`/website/${website.index}/report`} style={{ textDecoration: 'none', flex: '1 1 calc(33% - 1rem)' }}>
              <Card key={website.domain} withBorder p="md" mb="md" shadow='md'>
                <Title order={3}>{new URL(website.domain).hostname}</Title>
              </Card>
            </Link>
          ))}
        </Flex>
      </Box>
    </Layout >
  )
}

export default Dashboard
