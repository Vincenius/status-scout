import { Button, Modal, PinInput, Select, Text, TextInput } from '@mantine/core'
import { notificationMap } from '@/utils/checks'
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useAuthSWR } from '@/utils/useAuthSWR'
import getFormData from '@/utils/getFormData'

function NewNotificationChannelModal({ opened, close, onlyEmail }) {
  const { mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState('email');
  const [verificationStep, setVerificationStep] = useState(false);
  const [error, setError] = useState(null);

  const closeModal = () => {
    setVerificationStep(null)
    setError(null)
    setLoading(false)
    setChannel('email')
    close()
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
        if (formData.type === 'sms' || formData.type === 'email') {
          setVerificationStep(formData)
        } else {
          closeModal()
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
        number: verificationStep.value
      }),
    }).then(res => res.json()).then(res => {
      if (res.error) {
        setError(res.error)
      } else {
        closeModal()
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
    <Modal size="sm" title="Add New Notification Channel" opened={opened} onClose={closeModal}>
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
            { value: 'sms', label: 'SMS', disabled: onlyEmail },
            { value: 'ntfy', label: 'ntfy', disabled: onlyEmail },
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
      {verificationStep?.type === 'sms' && <form onSubmit={handleVerifySubmit}>
        <Text mb="md">A verification code has been sent to your phone. Please enter it below to verify your phone number.</Text>
        <PinInput type="number" length={6} name="verificationCode" mb="md" />

        {error && <Text c="red" mb="md">{error}</Text>}

        <Button type="submit" loading={loading} mt="lg">Submit Code</Button>
      </form>}

      {verificationStep?.type === 'email' && <div>
        <Text mb="md">We've sent a verification link to your email. Please check your inbox and click the link to verify your email address.</Text>
        <Button onClick={closeModal}>Close</Button>
      </div>}
    </Modal>
  )
}

export default NewNotificationChannelModal
