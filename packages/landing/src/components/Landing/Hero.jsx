import { useState } from 'react'
import { useForm } from '@mantine/form';
import { ActionIcon, Box, Flex, Image, Text, TextInput, ThemeIcon, Title, useMantineColorScheme } from '@mantine/core'
import { IconArrowRight, IconSearch } from '@tabler/icons-react'
import { trackEvent } from '@/utils/trackEvent'
import classes from './Landing.module.css';

function isValidUrl(value) {
  try {
    const url = new URL(normalizeUrl(value));
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const hasValidHostname =
      /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) ||
      /^[\d.]+$/.test(url.hostname);

    return isHttp && hasValidHostname;
  } catch (_) {
    return false;
  }
}

function normalizeUrl(value) {
  // If user entered without scheme, default to https
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

export default function Hero() {
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const heroImage = colorScheme === 'dark'
    ? '/screenshot-dark.png'
    : '/screenshot-light.png';

  const form = useForm({
    initialValues: {
      url: '',
    },
    validate: {
      url: (value) => isValidUrl(value) ? null : 'Please enter a valid URL',
    },
  });

  const handleSubmit = ({ url }) => {
    const normalizedUrl = normalizeUrl(url.trim());
    const parsed = new URL(normalizedUrl);
    const finalUrl = parsed.origin;

    if (!isValidUrl(normalizedUrl)) {
      form.setFieldError('url', 'Please enter a valid URL');
      return;
    }

    setLoading(true)
    trackEvent('quickcheck', { url: finalUrl })
    fetch(`${import.meta.env.VITE_API_URL}/v1/quickcheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ url: finalUrl }),
    }).then(res => res.json())
      .then(res => {
        if (res.statusCode === 200 && res.quickcheckId) {
          window.location.href = `${import.meta.env.VITE_APP_URL}/quickcheck?id=${res.quickcheckId}`
        } else {
          form.setFieldError('url', `Could not reach ${url} [Status: ${res.statusCode}]`);
        }
      }).finally(() => {
        setLoading(false)
      })
  };

  return (
    <Flex w="100%" mx="auto" my="4em" gap="xl" justify="space-between" direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'initial' }}>
      <Box className={classes.bgPattern}></Box>

      <Flex w="100%" maw={700} direction="column" justify="space-around" gap={{ base: 'xl', md: '0' }}>
        <Title order={1} fw="100" className={classes.title}>
          Your Website’s Health<br /><span className={classes.highlight}>All in One Place</span>
        </Title>

        <Text size="xl" maw={600}>
          Get a complete overview of your website’s security, performance, and more. Find broken links, performance bottlenecks, and other issues that hurt your website.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex w="100%">
            <TextInput
              placeholder="https://www.yourdomain.com"
              size="xl"
              variant="filled"
              w="100%"
              {...form.getInputProps('url')}
              styles={{
                input: {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            />
            <ActionIcon
              variant="filled"
              radius="md"
              type="submit"
              aria-label="Run Check"
              w={60}
              h={60}
              loading={loading}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            >
              <IconArrowRight stroke={1.5} />
            </ActionIcon>
          </Flex>
          <Flex gap="sm" align="center" mt="xs" mb="xl">
            <ThemeIcon variant="light" size="md">
              <IconSearch style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
            <Text size="lg">Check your website for free - no account needed</Text>
          </Flex>
        </form>
      </Flex>

      <Image src={heroImage} alt="Quick Check Screenshot" w={300} />
    </Flex>
  );
}
