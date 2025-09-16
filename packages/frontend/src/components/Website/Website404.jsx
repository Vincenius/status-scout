import Layout from '@/components/Layout/Layout';
import { Card, Title, Text } from '@mantine/core';

function Website404() {
  return (
    <Layout title="Website 404">
      <Card maw={600} mx="auto" shadow="sm" p="lg" withBorder>
        <Title order={2} align="center" mb="md">
          Website Not Found
        </Title>
        <Text align="center">
          Sorry, we couldn't find the website you were looking for.
        </Text>
      </Card>
    </Layout>
  );
}

export default Website404;
