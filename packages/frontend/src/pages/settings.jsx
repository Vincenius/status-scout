import Layout from '@/components/Layout/Layout'
import { ActionIcon, Box, Button, Card, Flex, List, Modal, PasswordInput, PinInput, Select, Table, Text, TextInput, ThemeIcon, Title } from '@mantine/core'
import { IconBell, IconBrandPowershell, IconLock, IconMail, IconPhone, IconPlus, IconTrash, IconUser } from '@tabler/icons-react'
import { useAuthSWR } from '@/utils/useAuthSWR'
import getFormData from '@/utils/getFormData'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { Link } from 'react-router-dom'
import { notifications } from '@mantine/notifications';

const ChannelIconMap = {
  email: IconMail,
  sms: IconPhone,
  ntfy: IconBrandPowershell
}

const inputMap = {
  email: { label: 'E-Mail Address', placeholder: 'you@example.com', type: 'email' },
  sms: { label: 'Phone Number', placeholder: '123-456-7890', type: 'text' },
  ntfy: { label: 'ntfy Topic', placeholder: 'your-topic', type: 'text' },
}

function Settings() {
  const { data: user = {}, mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [channel, setChannel] = useState('email');
  const [pwModalOpened, { open: openPwModal, close: closePwModal }] = useDisclosure(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState();
  const [verificationStep, setVerificationStep] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const verifiedChannel = url.searchParams.get('verifiedChannel');
    if (verifiedChannel !== null) {
      if (verifiedChannel === 'true') {
        notifications.show({
          title: 'Channel verified',
          message: 'Your notification channel has been verified successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Verification failed',
          message: 'Channel verification failed. Please try again or contact support.',
          color: 'red',
        });
      }
      url.searchParams.delete('verifiedChannel');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const openModal = e => {
    e.preventDefault();
    open();
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true)
    const formData = getFormData(e)

    fetch(`${import.meta.env.VITE_API_URL}/v1/user/notification-channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    }).then(res => res.json()).then(res => {
      if (res.error) {
        setError(res.error)
      } else {
        if (formData.type === 'sms') {
          setVerificationStep(formData.value)
        } else {
          close()
          notifications.show({
            title: 'Channel added',
            message: 'Your notification channel has been added successfully.',
            color: 'green',
          })
          mutate()
        }
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleVerifySubmit = (e) => {
    e.preventDefault()

    const formData = getFormData(e)
    setError(null)
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}/v1/user/verify-phone-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        code: formData.verificationCode,
        number: verificationStep
      }),
    }).then(res => res.json()).then(res => {
      if (res.error) {
        setError(res.error)
      } else {
        close()
        setVerificationStep(null)
        notifications.show({
          title: 'Channel added',
          message: 'Your notification channel has been added and verified successfully.',
          color: 'green',
        })
        mutate()
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  const deleteChannel = (index) => {
    setDeleteLoading(index)
    fetch(`${import.meta.env.VITE_API_URL}/v1/user/notification-channel?index=${index}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(res => res.json()).then(res => {
      if (res.error) {
        notifications.show({
          title: 'Something went wrong',
          message: 'Your notification channel could not be deleted. Please try again or contact support.',
          color: 'red',
        })
      }
      else {
        notifications.show({
          title: 'Channel deleted',
          message: 'Your notification channel has been deleted successfully.',
          color: 'green',
        })
        mutate()
      }
    }).finally(() => {
      setDeleteLoading(null)
    })
  }

  const handlePwChange = (e) => {
    e.preventDefault()

    const formData = getFormData(e)
    setError(null)
    setPwLoading(true)

    fetch(`${import.meta.env.VITE_API_URL}/v1/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    }).then(res => res.json()).then(res => {
      if (res.error) {
        setError(res.error)
      } else {
        closePwModal()
        notifications.show({
          title: 'Password changed',
          message: 'Your password has been changed successfully.',
          color: 'green',
        })
      }
    }).finally(() => {
      setPwLoading(false)
    })
  }

  return (
    <Layout title="Settings">
      <Title order={1} size="h1" ta="center" mb="xl" mt="md">Settings</Title>

      <Box maw={800} mx="auto">
        <Card withBorder p="md" mb="xl" shadow='md'>
          <Card.Section p="md" withBorder>
            <Flex align="center" gap="sm">
              <ThemeIcon size={30} radius="md" variant="light">
                <IconUser size={18} />
              </ThemeIcon>
              <Title order={2} fw="normal">Account</Title>
            </Flex>
          </Card.Section>

          <Card.Section p="md" withBorder>
            <Flex gap="sm" mb="md">
              <ThemeIcon size={24} radius="sm" variant="outline">
                <IconMail size={16} />
              </ThemeIcon>
              <Text><b>E-Mail:</b> {user.email}</Text>
            </Flex>
            <Flex gap="sm">
              <ThemeIcon size={24} radius="sm" variant="outline">
                <IconLock size={16} />
              </ThemeIcon>
              <Box>
                <Text><b>Password:</b> ********</Text>
                <Text><a href="#open-pw-modal" onClick={e => {
                  e.preventDefault()
                  openPwModal()
                }}>Change password</a></Text>
              </Box>
            </Flex>

            {/* todo plan -> cancel / upgrade */}

            {/* todo delete account */}
            <Button color="red" variant="outline" mt="xl">Delete Account</Button>
          </Card.Section>
        </Card>
        <Card withBorder p="md" mb="md" shadow='md'>
          <Card.Section p="md" withBorder>
            <Flex align="center" gap="sm">
              <ThemeIcon size={30} radius="md" variant="light">
                <IconBell size={18} />
              </ThemeIcon>
              <Title order={2} fw="normal">Notifications</Title>
            </Flex>
          </Card.Section>

          <Card.Section p="md" withBorder>
            <Title order={3} mb="md" fw="normal">Your Notification Channels:</Title>

            <Table withRowBorders mb="md">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td w={40}>
                    <ThemeIcon size={24} radius="sm" variant="outline">
                      <IconMail size={16} />
                    </ThemeIcon>
                  </Table.Td>
                  <Table.Td>
                    <Text>{user.email}</Text>
                  </Table.Td>
                </Table.Tr>

                {
                  (user.notificationChannels || []).map((channel, index) => {
                    const ChannelIcon = ChannelIconMap[channel.type] || IconMail
                    return (
                      <Table.Tr key={`channel-${index}`}>
                        <Table.Td w={40}>
                          <ThemeIcon size={24} radius="sm" variant="outline">
                            <ChannelIcon size={16} />
                          </ThemeIcon>
                        </Table.Td>
                        <Table.Td>
                          <Flex gap="xs" align="center">
                            <Text>{channel.value}</Text>
                            {!channel.verified && (
                              <Text c="dimmed">(pending verification)</Text>
                            )}
                          </Flex>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon loading={deleteLoading === index} color="red" variant="outline" size="sm" onClick={() => deleteChannel(index)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })
                }
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Button mt="xs" variant="outline" leftIcon={<IconPlus size={16} />} onClick={openModal}>
                      Add New Channel
                    </Button>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card.Section>
        </Card>
      </Box>
      <Modal size="sm" title="Add New Notification Channel" opened={opened} onClose={close}>
        {!verificationStep && <form onSubmit={handleSubmit}>
          <Select
            name="type"
            required
            mb="md"
            label="Channel Type"
            placeholder="Pick value"
            value={channel}
            onChange={setChannel}
            data={[
              { value: 'email', label: 'E-Mail' },
              { value: 'sms', label: 'SMS' },
              { value: 'ntfy', label: 'ntfy' },
              { value: 'slack', label: 'Slack (coming soon)', disabled: true },
              { value: 'discord', label: 'Discord (coming soon)', disabled: true },
              { value: 'whatsapp', label: 'WhatsApp (coming soon)', disabled: true },
            ]}
          />

          <TextInput
            name="value"
            required
            mb="lg"
            label={inputMap[channel]?.label || 'Value'}
            placeholder={inputMap[channel]?.placeholder || 'Enter value'}
            type={inputMap[channel]?.type || 'text'}
          />

          {error && <Text c="red" mb="md">{error}</Text>}

          <Button type="submit" loading={loading}>Add Channel</Button>
        </form>}
        {verificationStep && <form onSubmit={handleVerifySubmit}>
          <Text mb="md">A verification code has been sent to your phone. Please enter it below to verify your phone number.</Text>
          <PinInput type="number" length={6} name="verificationCode" mb="md" />

          {error && <Text c="red" mb="md">{error}</Text>}

          <Button type="submit" loading={loading} mt="lg">Submit Code</Button>
        </form>}
      </Modal>

      <Modal size="sm" title="Change Password" opened={pwModalOpened} onClose={closePwModal}>
        <form onSubmit={handlePwChange}>
          <PasswordInput
            name="currentPassword"
            required
            label="Current Password"
            placeholder="Enter current password"
            type="password"
            mb="xs"
          />
          <Text size="xs" mb="md"><Link to="/forgot-password">Forgot password?</Link></Text>
          <PasswordInput
            name="newPassword"
            required
            mb="lg"
            label="New Password"
            placeholder="Enter new password"
            type="password"
            description="Min. 8 characters"
            minLength={8}
          />

          {error && <Text c="red" mb="md">{error}</Text>}

          <Button type="submit" loading={pwLoading}>Change Password</Button>
        </form>
      </Modal>
    </Layout>
  )
}

export default Settings
