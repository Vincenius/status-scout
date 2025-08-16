import { Blockquote, Button, Flex, Modal, Textarea, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks';
import getFormData from '@/utils/getFormData'
import { useState } from 'react';

function FeedbackButton({ children, ...props }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true)
    const formData = getFormData(e)

    fetch(`${import.meta.env.VITE_API_URL}/v1/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then(res => res.json()).then(res => {
      console.log('feedback', res)
      setSuccess(true)
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <>
      <Button {...props} onClick={open}>{children}</Button>

      <Modal size="lg" title="Feedback" opened={opened} onClose={close}>
        <form onSubmit={handleSubmit}>
          <Textarea name="feedback" label="Your Feedback / Bugreport" required mb="sm" placeholder="Write your feedback here" autosize minRows={5} />
          <TextInput name="website" label="Website (optional)" description="The website you used for your check" mb="md" placeholder="example.com" />
          <TextInput name="email" label="Email (optional)" type="email" description="Your email so I can get back to you" mb="md" placeholder="you@example.com" />

          {success && <Blockquote color="indigo" mb="md" p="sm">
            <b>Thanks for your feedback</b><br />
            I really appreciate you taking the time to share your thoughts.
          </Blockquote>}
          <Flex justify="flex-end">
            <Button type="submit" loading={loading} disabled={success}>Submit</Button>
          </Flex>
        </form>

      </Modal>
    </>
  )
}

export default FeedbackButton
