import { Title, Text, Button, Container, Card } from "@mantine/core";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout/Layout";

export default function EmailConfirmed() {
  return (
    <Layout title="Email Confirmed">
      <Card maw={500} mx="auto" mt="xl" p="xl" shadow="sm">
        <Title order={1}>Your email is confirmed!</Title>
        <Text size="lg" mt="md">
          Thanks for verifying your address. We’ll notify you as soon as monitoring becomes available.
        </Text>
        <Button component={Link} to="/" mt="xl" c="white">
          Go back home
        </Button>
      </Card>
    </Layout>

  );
}
