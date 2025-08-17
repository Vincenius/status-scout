import { Table, Text, Title, Stack, Box, Flex, List, Card } from "@mantine/core";
import { IconCheck, IconCode, IconBellRinging, IconShieldLock } from "@tabler/icons-react";
import classes from "./Landing.module.css";

export default function Roadmap({
  heading = "Product Roadmap",
  subheading = "Here’s what we’ve built and what’s coming next.",
  items = defaultItems,
}) {
  return (
    <Box
      mx="auto"
      maw={900}
      withBorder
      radius="xl"
      p="md"
      py="8em"
      style={{ position: "relative" }}
    >
      <Box className={classes.circuitPattern}></Box>
      <Stack align="center" gap="xs" mb="xl">
        <Title order={2} size="2em" ta="center">{heading}</Title>
        <Text size="lg" ta="center">
          {subheading}
        </Text>
      </Stack>

      <Table
        withTableBorder
        withColumnBorders
        display={{ base: "none", xs: "table" }}
        bg="var(--mantine-color-body)"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Status</Table.Th>
            <Table.Th>Feature</Table.Th>
            <Table.Th>Description</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, idx) => (
            <Table.Tr key={idx}>
              <Table.Td>
                <Flex gap="xs">
                  {item.icon}
                  <Text size="sm" c={item.completed ? "green" : "dimmed"}>
                    {item.completed ? "Done" : "Planned"}
                  </Text>
                </Flex>
              </Table.Td>
              <Table.Td>
                <Text fw={500}>{item.title}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {item.description}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Card display={{ base: "block", xs: "none" }} mt="xl" withBorder radius="md" p="md" bg="var(--mantine-color-body)">
        <List spacing="md">
          {items.map((item, idx) => (
            <List.Item key={idx} icon={item.icon} color={item.completed ? "green" : "dimmed"}>
              <Text fw={500}>{item.title}</Text>
              <Text size="sm">{item.description}</Text>
            </List.Item>
          ))}
        </List>
      </Card>

    </Box>
  );
}

// Default roadmap items
const defaultItems = [
  {
    title: "Website Health Scanner",
    description: "Core features: security checks, performance insights, SEO audits, a11y checks, and broken link detection.",
    icon: <IconCheck size={18} color="green" />,
    completed: true,
  },
  {
    title: "Monitoring",
    description: "Get notified instantly when something breaks on your site.",
    icon: <IconBellRinging size={18} color="orange" />,
    completed: false,
  },
  {
    title: "Custom Test Flows",
    description: "Simulate critical user journeys to ensure smooth experiences.",
    icon: <IconCode size={18} color="orange" />,
    completed: false,
  },
  {
    title: "Advanced Security Checks",
    description: "Add DNS checks and codebase vulnerability scans.",
    icon: <IconShieldLock size={18} color="orange" />,
    completed: false,
  },
];
