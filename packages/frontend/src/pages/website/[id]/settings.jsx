import { Button, Container, LoadingOverlay, Title, Modal, Flex, Text, Card, List, ActionIcon, ThemeIcon, Select, SegmentedControl, Table, Grid, SimpleGrid, Divider, Box } from '@mantine/core';
import Layout from '@/components/Layout/Layout';
import Website404 from '@/components/Website/Website404';
import { useAuthSWR } from '@/utils/useAuthSWR'
import { useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { IconBell, IconCheck, IconPencil } from '@tabler/icons-react';
import getFormData from '@/utils/getFormData'
import { checkDefaultNotifications, checkNameMap, notificationMap } from '@/utils/checks';
import NewNotificationChannelModal from '@/components/NewNotificationChannelModal/NewNotificationChannelModal'

const NotificationChannel = ({ website, user, edit, setEdit, channelLoading, handleChannelChange, channelType, description, name, onlyEmail, openChannel }) => {
  const activeChannel = (user?.notificationChannels || []).find(c => c.id === website?.[channelType])

  return <>
    <Text fw="bold">{name}</Text>
    <Text c="dimmed">{description}</Text>

    <form onSubmit={e => handleChannelChange(e, channelType)}>
      <Flex gap="xs" align="center" mt="xs" w="100%">
        {edit !== channelType && <>
          {website?.[channelType] === 'email' && <Text>{user.email}</Text>}
          {website?.[channelType] !== 'email' && <Text>
            {activeChannel ? `${activeChannel.value} (${activeChannel.verified ? notificationMap[activeChannel.type]?.label : 'Not verified'})` : 'Disabled'}
          </Text>}
          <ActionIcon size="sm" variant="outline" onClick={() => setEdit(channelType)}>
            <IconPencil size="1rem" />
          </ActionIcon>
        </>}
        {edit === channelType && <>
          <Select
            w="100%"
            size='xs'
            name="channel"
            data={[
              { value: 'email', label: user.email },
              ...user.notificationChannels
                .filter(c => onlyEmail ? c.type === 'email' : true)
                .map(c => ({
                  value: c.id,
                  label: `${c.value} (${c.verified ? notificationMap[c.type]?.label : 'Not verified'})`,
                  disabled: c.verified !== true,
                })),
              { value: 'disabled', label: 'Disabled' },
              { value: 'add', label: 'Add New Channel' },
            ]}
            onChange={(value) => {
              if (value === 'add') {
                openChannel();
                setEdit(null);
              }
            }}
            defaultValue={website?.[channelType] || 'disabled'}
          />
          <ActionIcon variant="outline" type="submit" loading={channelLoading === channelType}>
            <IconCheck size="1rem" />
          </ActionIcon>
        </>}
      </Flex>
    </form>
  </>
}

function WebsiteSettings() {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [channelOpened, { open: openChannel, close: closeChannel }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [channelLoading, setChannelLoading] = useState();
  const [edit, setEdit] = useState();
  const { id } = useParams();
  const { data: websites = [], isLoading: isLoadingWebsites, mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const { data: flows = [], mutate: mutateFlows, isLoading: isLoadingFlows } = useAuthSWR(id && `${import.meta.env.VITE_API_URL}/v1/flows?websiteId=${id}`)
  const { data: user = {} } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
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

  const handleChannelChange = async (e, type) => {
    e.preventDefault();
    const formData = getFormData(e);
    setChannelLoading(type);

    fetch(`${import.meta.env.VITE_API_URL}/v1/website/notification-channel`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        websiteId: website.id,
        type,
      })
    }).then(res => {
      if (res.ok) {
        mutate();
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setChannelLoading(null);
      setEdit(null);
    });
  }

  const handlePrioChange = async (value, check) => {
    fetch(`${import.meta.env.VITE_API_URL}/v1/website/notifications`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        check,
        value,
        websiteId: website.id,
      })
    }).catch(err => {
      console.error(err);
    })
  }

  const handleCustomPrioChange = async (value, flow) => {
    await fetch(`${import.meta.env.VITE_API_URL}/v1/flows`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        check: {
          ...flow,
          editId: flow._id,
          notification: value,
        },
        websiteId: website.id
      }),
    }).catch(err => {
      console.error(err);
    })
  }

  return (
    <Layout title="Website Settings">
      {isLoadingWebsites && <LoadingOverlay />}
      <Container size="md" py="md" px={{ base: "0", md: "md" }}>
        <Title size="h1" ta="center" mb="xl">Settings for {host}</Title>

        <Card withBorder shadow="md">
          <Card.Section p="md" withBorder>
            <Flex align="center" gap="sm">
              <ThemeIcon size={30} radius="md" variant="light">
                <IconBell size={18} />
              </ThemeIcon>
              <Title order={2} fw="normal">Notification Settings</Title>
            </Flex>
          </Card.Section>
          <Card.Section p="md" withBorder>

            <Card withBorder>
              <NotificationChannel
                website={website}
                user={user}
                edit={edit}
                setEdit={setEdit}
                channelLoading={channelLoading}
                handleChannelChange={handleChannelChange}
                channelType="criticalChannel"
                name="Critical Issue Notification"
                description="Send notification once the issue is detected"
                openChannel={openChannel}
              />
            </Card>
            <Card withBorder mt="md">
              <NotificationChannel
                website={website}
                user={user}
                edit={edit}
                setEdit={setEdit}
                channelLoading={channelLoading}
                handleChannelChange={handleChannelChange}
                channelType="dailyChannel"
                name="Issue Notification"
                description="Send daily summary of new issues via E-Mail"
                onlyEmail
                openChannel={openChannel}
              />
            </Card>

            {/* <Button mt="xl" variant="outline" onClick={openChannel}>Add Notification Channel</Button> */}
            <NewNotificationChannelModal opened={channelOpened} close={closeChannel} />
          </Card.Section>
          <Card.Section p="md" withBorder>
            <Text mb="md">Customize notification priority per check.</Text>

            {Object.entries(checkDefaultNotifications).map(([check, defaultChannel]) => (
              <Box key={`${check}-notification-setting`}>
                <SimpleGrid cols={2} gap="xs">
                  <Text fw="bold" mt="xs">{checkNameMap[check]}:</Text>
                  <SegmentedControl
                    data={[{ value: 'critical', label: 'Critical' }, { value: 'daily', label: 'Daily' }, { value: 'disabled', label: 'Disabled' }]}
                    defaultValue={website?.notifications[check] || defaultChannel}
                    onChange={e => handlePrioChange(e, check)}
                  />
                </SimpleGrid>
                <Divider my="xs" />
              </Box>
            ))}

            {flows && flows.length > 0 && <Box mt="xl">
              <Text mb="md">Customize notification priority for your custom test flows.</Text>

              {flows.map(flow => (
                <Box key={`${flow._id}-notification-setting`}>
                  <SimpleGrid cols={2} gap="xs">
                    <Text fw="bold" mt="xs">{flow.name}:</Text>
                    <SegmentedControl
                      data={[{ value: 'critical', label: 'Critical' }, { value: 'daily', label: 'Daily' }, { value: 'disabled', label: 'Disabled' }]}
                      defaultValue={flow.notification || 'daily'}
                      onChange={e => handleCustomPrioChange(e, flow)}
                    />
                  </SimpleGrid>
                  <Divider my="xs" />
                </Box>
              ))}
            </Box>}
          </Card.Section>
        </Card>

        <Button color="red" variant="outline" mt="xl" onClick={open}>Delete Website</Button>
      </Container >

      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Text>Are you sure you want to delete this website?</Text>
        <Text mt="sm">This action cannot be undone.</Text>

        <Flex justify="flex-end" mt="md" gap="sm">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={loading}>Delete</Button>
        </Flex>
      </Modal>
    </Layout >
  );
}

export default WebsiteSettings;
