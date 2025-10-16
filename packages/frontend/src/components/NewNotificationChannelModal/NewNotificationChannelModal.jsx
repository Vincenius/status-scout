import { Button, Modal, PinInput, Select, Text, TextInput } from '@mantine/core'
import { notificationMap } from '@/utils/checks'
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useAuthSWR } from '@/utils/useAuthSWR'
import getFormData from '@/utils/getFormData'

function NewNotificationChannelModal({ opened, close }) {
  const { mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState('email');
  const [verificationStep, setVerificationStep] = useState(false);
  const [error, setError] = useState(null);

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

  return (
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
          label={notificationMap[channel]?.label || 'Value'}
          placeholder={notificationMap[channel]?.placeholder || 'Enter value'}
          type={notificationMap[channel]?.type || 'text'}
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
  )
}

export default NewNotificationChannelModal
