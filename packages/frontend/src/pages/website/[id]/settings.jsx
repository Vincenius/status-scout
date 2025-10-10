import { Button, Container, LoadingOverlay, Title, Modal, Flex, Text } from '@mantine/core';
import Layout from '@/components/Layout/Layout';
import Website404 from '@/components/Website/Website404';
import { useAuthSWR } from '@/utils/useAuthSWR'
import { useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function WebsiteSettings() {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { data: websites = [], isLoading: isLoadingWebsites, mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const website = websites.find(w => w.index === id)

  const host = website ? new URL(website.domain).hostname : '';

  if (!isLoadingWebsites && !website) {
    return (
      <Website404 />
    )
  }

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`${import.meta.env.VITE_API_URL}/v1/website?id=${website.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    mutate();
    setLoading(false);
    close();
    navigate('/dashboard');
  }

  return (
    <Layout title="Website Settings">
      {isLoadingWebsites && <LoadingOverlay />}
      <Container size="md" py="md" px={{ base: "0", md: "md" }}>
        <Title size="h1" ta="center" mb="sm">Settings for {host}</Title>

        {/* todo alert settings */}
        {/* <Card.Section p="md" withBorder>
            <Title order={3} mb="md" fw="normal">Notification Settings:</Title>

            <List>
              <List.Item>
                <Text>Critical Issue Alert</Text>
              </List.Item>
              <List.Item>
                <Text>Daily Issue E-Mail</Text>
              </List.Item>
            </List>
          </Card.Section> */}

        {/* settings per check expandable */}
        {/* notification settings -> critical, warning, info, disabled */}
        {/* info can be customized per website in website settings */}

        <Button color="red" variant="outline" mt="xl" onClick={open}>Delete Website</Button>
      </Container>

      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Text>Are you sure you want to delete this website?</Text>
        <Text mt="sm">This action cannot be undone.</Text>

        <Flex justify="flex-end" mt="md" gap="sm">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={loading}>Delete</Button>
        </Flex>
      </Modal>
    </Layout>
  );
}

export default WebsiteSettings;
