import { useState } from 'react'
import { useForm } from '@mantine/form';
import Layout from '@/components/Layout/Layout'
import { ActionIcon, Box, Flex, Text, TextInput, Title } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { trackEvent } from '@/utils/trackEvent'
import { useNavigate } from 'react-router-dom'

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

function QuickCheck() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
          navigate(`/quickcheck?id=${res.quickcheckId}`)
        } else {
          form.setFieldError('url', `Could not reach ${url} [Status: ${res.statusCode}]`);
        }
      }).finally(() => {
        setLoading(false)
      })
  };

  return (
    <Layout title="Quick Check" hideNav={true}>
      <Box shadow="md" maw="800px" mx="auto" py="xl">
        <Title mb="md" order={1} fw="normal">Check Your Website’s Health</Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Text size="xl">Enter your website URL to run a quick check:</Text>
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
        </form>
      </Box>
    </Layout>
  )
}

export default QuickCheck
