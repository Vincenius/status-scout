import { Box, Flex, SimpleGrid, Text, ThemeIcon, Title } from "@mantine/core";
import classes from './Landing.module.css';
import { IconStar } from "@tabler/icons-react";

export default function SocialProof({ }) {
  return (
    <Box mx="auto" mt="12em" mb="2em" py="6em" textAlign="center" maxWidth={600} style={{ position: 'relative' }}>
      <Box className={classes.bgImage}></Box>

      <Title order={2} mb="md" zIndex={1} position="relative" fw="lighter">
        Delived insights for over <b>600+</b> websites and counting
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="lg" mt="xl">
        <Flex gap="md">
          <ThemeIcon variant="light" size="md">
            <IconStar size="70%" stroke={1.5} />
          </ThemeIcon>
          <Text>Free - No signup required</Text>
        </Flex>
        <Flex gap="md">
          <ThemeIcon variant="light" size="md">
            <IconStar size="70%" stroke={1.5} />
          </ThemeIcon>
          <Text>Open-Source</Text>
        </Flex>
        <Flex gap="md">
          <ThemeIcon variant="light" size="md">
            <IconStar size="70%" stroke={1.5} />
          </ThemeIcon>
          <Text>Hosted in Europe</Text>
        </Flex>
        <Flex gap="md">
          <ThemeIcon variant="light" size="md">
            <IconStar size="70%" stroke={1.5} />
          </ThemeIcon>
          <Text>Runs on renewable energy</Text>
        </Flex>
      </SimpleGrid>
    </Box>
  );
}
