import Layout from '@/components/Layout/Layout';
import { Container, Title, Card, ThemeIcon, TextInput, Button } from '@mantine/core';
import { IconBrowserPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuthSWR } from '@/utils/useAuthSWR';

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

function Onboarding() {
  // todo redirect to dashboard if 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { data: websites = [], mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const form = useForm({
    initialValues: {
      url: '',
    },
    validate: {
      url: (value) => isValidUrl(value) ? null : 'Please enter a valid URL',
    },
  });

  useEffect(() => {
    if (websites.length) {
      navigate('/dashboard');
    }
  }, [websites]);

  const handleSubmit = async ({ url }) => {
    const normalizedUrl = normalizeUrl(url.trim());

    if (!isValidUrl(normalizedUrl)) {
      form.setFieldError('url', 'Please enter a valid URL');
      return;
    }

    const parsed = new URL(normalizedUrl);
    const finalUrl = parsed.origin;

    setLoading(true)
    try {
      // check if website is reachable
      const { statusCode } = await fetch(`${import.meta.env.VITE_API_URL}/v1/statuscheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url: finalUrl }),
      }).then(res => res.json())

      if (statusCode === 200) {
        // create website
        const { id, index } = await fetch(`${import.meta.env.VITE_API_URL}/v1/website`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ url: finalUrl }),
        }).then(res => res.json())

        // trigger initial check for id
        await fetch(`${import.meta.env.VITE_API_URL}/v1/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ id }),
        })

        await mutate()

        navigate(`/website/${index}/report`);
      } else {
        form.setFieldError('url', `Could not reach ${url} [Status: ${statusCode}]`);
      }
    } catch (e) {
      console.error(e);
      form.setFieldError('url', 'An unexpected error occurred while checking the URL. Please contact the support team.');
    }

    setLoading(false);
  };

  return (
    <Layout title="Configure your account">
      <Container size="sm" py={40}>
        <Card maw={400} p="md" mx="auto" withBorder shadow='md'>
          <ThemeIcon variant="light" size="xl" mx="auto" mb="md">
            <IconBrowserPlus style={{ width: '70%', height: '70%' }} />
          </ThemeIcon>
          <Title order={2} align="center" mb="xl">
            Add your first website
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              placeholder="https://yourdomain.com"
              label="Website URL"
              size="lg"
              mb="xl"
              {...form.getInputProps('url')}
              required
            />
            <Button size="lg" type='submit' fullWidth loading={loading}>Continue</Button>
          </form>
        </Card>
      </Container>
    </Layout>
  );
}

export default Onboarding;
