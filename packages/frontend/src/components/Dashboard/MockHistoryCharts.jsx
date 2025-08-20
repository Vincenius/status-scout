import { Box, Button, Card, Divider, Flex, Text, ThemeIcon, Title, Modal, TextInput, Checkbox } from '@mantine/core'
import { IconBrandSpeedtest, IconChartBar, IconShieldLock, IconZoomCode } from '@tabler/icons-react'
import { useMantineColorScheme } from '@mantine/core';
import HistoryChart from '@/components/Dashboard/HistoryChart';
import { useState } from 'react';
import getFormData from '@/utils/getFormData'

function MockHistoryCharts() {
  const { colorScheme } = useMantineColorScheme();
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true)
    const formData = getFormData(e)

    fetch(`${import.meta.env.VITE_API_URL}/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then(res => res.json()).then(res => {
      setSuccess(true)
    }).catch(e => setError(e.message))
      .finally(() => {
        setLoading(false)
      })
  };

  const backgroundColor =
    colorScheme === 'dark'
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(255, 255, 255, 0.5)';
  return (
    <>
      <Flex mb="md" gap="md" direction={{ base: 'column', md: 'row' }} style={{ position: 'relative ' }} my="xl">
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: backgroundColor,
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 1,
            borderRadius: 'calc(0.25rem * 1)'
          }}
        >
          <Flex justify="center" align="center" h="100%" direction="column" gap="md" p="md">
            <Title order={2} size="h1" fw="normal" ta="center">Monitoring is coming soon...</Title>
            <Button size="lg" onClick={() => setOpened(true)}>Join the Waitlist</Button>
          </Flex>
        </Box>


        <Card withBorder shadow="md" w="100%">
          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconChartBar style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Uptime</Text>
            </Flex>

            <HistoryChart data={[{ result: { status: 'success' } }]} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconShieldLock style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Security</Text>
            </Flex>

            <HistoryChart data={[{ result: { status: 'success' } }]} />
          </Box>
        </Card>

        <Card withBorder shadow="md" w="100%">
          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconBrandSpeedtest style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">Performance</Text>
            </Flex>

            <HistoryChart data={[{ result: { status: 'success' } }]} />
          </Box>

          <Divider my="sm" />

          <Box>
            <Flex gap="xs" align="center" mb="xs">
              <ThemeIcon variant="default" size="md">
                <IconZoomCode style={{ width: '70%', height: '70%' }} />
              </ThemeIcon>
              <Text size="sm">SEO</Text>
            </Flex>

            <HistoryChart data={[{ result: { status: 'success' } }]} />
          </Box>
        </Card>
      </Flex>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Join the Waitlist">
        <Text mb="md">We will notify you when the monitoring feature is available.</Text>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Name"
            name="name"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            required
            mb="sm"
          />
          <TextInput
            label="Email"
            name="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.currentTarget.value)}
            required
            mb="sm"
            type="email"
          />
          <Checkbox
            label={
              <span>
                I accept the&nbsp;
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  privacy policy
                </a>
              </span>
            }
            required
            mb="sm"
          />
          <Button
            type="submit"
            loading={loading}
            fullWidth
            mt="md"
            disabled={success}
          >
            Join Waitlist
          </Button>
          {success && <Text c="green" mt="sm">Thanks for signing up! Please confirm your email to complete your waitlist registration.</Text>}
          {error && <Text c="red" mt="sm">{error}</Text>}
        </form>
      </Modal>
    </>
  )
}

export default MockHistoryCharts
