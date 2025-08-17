import { Title, Text, Button, Container } from "@mantine/core";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container style={{ textAlign: "center", padding: "80px 20px" }}>
      <Title order={1}>404</Title>
      <Text size="lg" mt="md">Page not found</Text>
      <Button component={Link} to="/" mt="xl">
        Go back home
      </Button>
    </Container>
  );
}
