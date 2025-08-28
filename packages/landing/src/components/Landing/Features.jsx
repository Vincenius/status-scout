import { Card, Stack, Text, Title, SimpleGrid, ThemeIcon } from "@mantine/core";
import {
  IconShieldCheck,
  IconSearch,
  IconBolt,
  IconLinkOff,
  IconArrowsShuffle,
  IconFlask,
  IconShieldLock,
  IconZoomCode,
  IconBrandSpeedtest,
  IconChartBar,
} from "@tabler/icons-react";

export default function Features() {
  const features = [
    {
      icon: <IconShieldLock style={{ width: '70%', height: '70%' }} />,
      title: "Security Checks",
      description:
        "We scan for exposed sensitive files like .env, missing security headers and invalid SSL certificates.",
    },
    {
      icon: <IconZoomCode style={{ width: '70%', height: '70%' }} />,
      title: "SEO & Accessibility Audits",
      description:
        "Get key insights from Lighthouse to improve search rankings and usability.",
    },
    {
      icon: <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />,
      title: "Performance Insights",
      description:
        "Identify what's slowing you down — using real PageSpeed data.",
    },
    {
      icon: <IconLinkOff style={{ width: '70%', height: '70%' }} />,
      title: "Broken Links Detection",
      description:
        "We crawl your site to find dead links and redirect issues.",
    },
    {
      icon: <IconChartBar style={{ width: '70%', height: '70%' }} />,
      title: "Monitoring - coming soon",
      description:
        "Know the moment when anything on your site breaks",
      disabled: true,
    },
    {
      icon: <IconArrowsShuffle style={{ width: '70%', height: '70%' }} />,
      title: "Custom Test Flows - coming soon",
      description:
        "Simulate user journeys and ensure critical paths keep working.",
      disabled: true,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mx="auto" mt="4em" mb="6em">
      {features.map((feature, index) => (
        <Card key={index} shadow="sm" radius="md" p="lg" withBorder>
          <Stack gap="xs">
            <Stack gap={6} align="center" direction="row">
              <ThemeIcon variant={feature.disabled ? 'default' : 'light'}>{feature.icon}</ThemeIcon>
              <Title order={2} size="h4" opacity={feature.disabled ? 0.8 : 1}>{feature.title}</Title>
            </Stack>
            <Text size="sm">
              {feature.description}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
