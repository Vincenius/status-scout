import Layout from '@/components/Layout/Layout';
import { Container, Title, Text, Center, Card, ThemeIcon } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';

function Confirm() {
  return (
    <Layout title="Confirm your email">
      <Container size="sm" py={40}>
        <Center>
          <Card shadow="md" radius="md" p={32} withBorder style={{ width: '100%', maxWidth: 480 }}>
            <ThemeIcon variant="light" size="xl" mx="auto" mb="md">
              <IconMail style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Title order={2} align="center" mb={16}>
              Thank you for signing up!
            </Title>
            <Text align="center" size="lg" mb={24}>
              Please check your inbox and <b>confirm your email address</b> to get started.
              Once confirmed, you can start using Status Scout.
            </Text>
          </Card>
        </Center>
      </Container>
    </Layout>
  );
}

export default Confirm;
