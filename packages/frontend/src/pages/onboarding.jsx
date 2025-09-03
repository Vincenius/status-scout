import Layout from '@/components/Layout/Layout';
import { Container, Title, Text, Center, Card, ThemeIcon } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';

function Onboarding() {
  return (
    <Layout title="Configure your account">
      <Container size="sm" py={40}>
        <ThemeIcon variant="light" size="xl" mx="auto" mb="md">
          <IconMail style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
        <Title order={2} align="center" mb={16}>
          Onboarding
        </Title>
      </Container>
    </Layout>
  );
}

export default Onboarding;
