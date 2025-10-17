import { Container, Title, Card, TextInput, Button, Stepper, Flex } from '@mantine/core';
import { IconBell, IconBrowserPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuthSWR } from '@/utils/useAuthSWR';
import { isValidUrl, normalizeUrl } from '@/utils/helper';
import NotificationSettings from '@/components/Notifications/NotificationSettings';

function CreateWebsite({ title }) {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const { mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const form = useForm({
    initialValues: {
      url: '',
    },
    validate: {
      url: (value) => isValidUrl(value) ? null : 'Please enter a valid URL',
    },
  });

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
        const { id, index, error } = await fetch(`${import.meta.env.VITE_API_URL}/v1/website`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ url: finalUrl }),
        }).then(res => res.json())

        if (error) {
          form.setFieldError('url', error);
          setLoading(false);
          return;
        }

        setResult({ id, index })

        // trigger initial check for id
        fetch(`${import.meta.env.VITE_API_URL}/v1/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ id }),
        })

        await mutate()

        setActive(1)
      } else {
        form.setFieldError('url', `Could not reach ${url} [Status: ${statusCode}]`);
      }
    } catch (e) {
      console.error(e);
      form.setFieldError('url', 'An unexpected error occurred while checking the URL. Please contact the support team.');
    }

    setLoading(false);
  };

  const goToReport = () => {
    navigate(`/website/${result.index}/report`);
  }

  return (
    <Container size="sm" py={40}>
      <Card size="md" p="md" mx="auto" withBorder shadow='md'>
        <Stepper active={active} onStepClick={setActive} size="sm" allowNextStepsSelect={false}>
          <Stepper.Step icon={<IconBrowserPlus size={18} />}>
            <Title order={2} align="center" mb="xl">
              {title}
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
          </Stepper.Step>
          <Stepper.Step icon={<IconBell size={18} />}>
            {result?.id && <>
              <NotificationSettings websiteId={result.id} noBorder>
                <Title order={2} align="center">
                  Notification Settings
                </Title>
              </NotificationSettings>

              <Flex gap="md" justify="flex-end" mt="md">
                <Button variant='outline' onClick={goToReport}>Skip</Button>
                <Button onClick={goToReport}>Continue</Button>
              </Flex>
            </>}
          </Stepper.Step>
        </Stepper>
      </Card>
    </Container>
  );
}

export default CreateWebsite;
