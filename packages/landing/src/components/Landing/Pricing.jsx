import { Box, Button, Card, List, SimpleGrid, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export default function Pricing({
}) {
  return (
    <Box mt="12em" mb="12em">
      <Title size="2em" order={2} ta="center" mt="sm" mb="1em">Pricing</Title>
      <Text c="dimmed" ta="center" fz="lg" mx="auto" maw="500px" mb="3em">
        Choose between our free self-hosted option or our managed cloud service for a hassle-free experience.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mx="auto">
        <Card shadow="sm" radius="md" p="lg" withBorder>
          <Card.Section mb="md" p="md" withBorder>
            <Title order={3} mb="sm" c="indigo">Self-hosted</Title>

            <Text fz="2em" fw={700}>Free forever</Text>
            <Text c="dimmed" fz="sm" mb="md">You only pay for your own server.</Text>

            <Text fz="sm">Deploy StatusScout to your infrastructure without any restrictions on features.</Text>
          </Card.Section>

          <Card.Section mb="md" p="md">
            <List
              center
              spacing="xs"
              icon={
                <ThemeIcon color="green" size={18} radius="sm">
                  <IconCheck size={16} />
                </ThemeIcon>
              }
            >
              <List.Item>All core features</List.Item>
              <List.Item>Self-managed updates</List.Item>
              <List.Item>Includes all upcoming features</List.Item>
            </List>
          </Card.Section>

          <Button component="a" href="https://github.com/vincenius/status-scout" target="_blank" rel="noopener" fullWidth variant="outline">
            Get Started with Self-hosting
          </Button>
        </Card>

        <Card shadow="sm" radius="md" p="lg" withBorder>
          {/* Cloud (head -> switch between monthly and yearly billing) */}
          <Card.Section mb="md" p="md" withBorder>
            <Title order={3} mb="sm" c="indigo">Cloud</Title>

            <Text fz="2em" fw={700}>$9/month</Text>
            <Text c="dimmed" fz="sm" mb="md">Billed annually. Monthly billing also available.</Text>
            <Text fz="sm">Fully managed service with priority support and automatic updates.</Text>
          </Card.Section>

          <Card.Section mb="md" p="md">
            <List
              center
              spacing="xs"
              icon={
                <ThemeIcon color="green" size={18} radius="sm">
                  <IconCheck size={16} />
                </ThemeIcon>
              }
            >
              <List.Item>All core features</List.Item>
              <List.Item>Automatic updates</List.Item>
              <List.Item>Includes all upcoming features</List.Item>
            </List>
          </Card.Section>

          <Button component="a" href="https://github.com/vincenius/status-scout" target="_blank" rel="noopener" fullWidth variant="outline">
            Get Started with Self-hosting
          </Button>
        </Card>

        {/* Enterprise -> contact */}
      </SimpleGrid>
    </Box>
  );
}
