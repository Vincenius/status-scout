import Layout from '@/components/Layout/Layout';
import { Container, Title } from '@mantine/core';

function WebsiteOverview() {
  return (
    <Layout title="Website Overview">
      <Container size="md" py="md" px={{ base: "0", md: "md" }}>
        <Title size="h1" ta="center" mb="sm">Overview</Title>

        here will be a history chart with all recent checks & alerts
        {/* todo checks */}
      </Container>
    </Layout>
  );
}

export default WebsiteOverview;
