import { Card, Stack, Text, Title, SimpleGrid, ThemeIcon, useMantineTheme, Flex } from "@mantine/core";
import {
  IconLinkOff,
  IconShieldLock,
  IconChartDots3,
  IconDeviceDesktopAnalytics,
  IconTrendingUp,
  IconCode,
} from "@tabler/icons-react";
import classes from './Landing.module.css';

export default function Features() {
  const theme = useMantineTheme();

  console.log(theme.primaryColor);
  const features = [
    {
      icon: IconShieldLock,
      title: "Protect Your Site",
      description:
        "Catch exposed sensitive files, DNS vulnerabilities, missing security headers, and more before they put your data at risk.",
    },
    {
      icon: IconLinkOff,
      title: "Find Broken Links",
      description:
        "Crawl your site automatically to detect and repair dead links or bad redirects, before users find them.",
    },
    {
      icon: IconChartDots3,
      title: "Ensure Every Journey Works",
      description:
        "Simulate user flows like signups or checkouts to guarantee smooth, reliable site experiences.",
    },
    {
      icon: IconDeviceDesktopAnalytics,
      title: "Stay Ahead with Monitoring",
      description:
        "Get instant alerts when something breaks. Resolve issues before they impact visitors.",
    },
    {
      icon: IconTrendingUp,
      title: "Boost Visibility",
      description:
        "Uncover actionable SEO and accessibility insights to rank higher, reach more visitors, and deliver a smoother experience for everyone.",
    },
    {
      icon: IconCode,
      title: "Verify Integrations",
      description:
        "Check that tools like Google Tag Manager, analytics scripts, or marketing pixels are properly loaded and firing as expected.",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mx="auto" mt="4em" mb="6em">
      {features.map((feature, index) => (
        <Card key={index} shadow="md" radius="md" p="lg" withBorder>
          <Flex gap="md">
            <ThemeIcon variant="light" size={44}>
              <feature.icon size="70%" stroke={1.5} />
            </ThemeIcon>
            <Title order={2} size="h4" className={classes.featureTitle}>{feature.title}</Title>
          </Flex>
          <Text size="sm" mt="md">
            {feature.description}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}
