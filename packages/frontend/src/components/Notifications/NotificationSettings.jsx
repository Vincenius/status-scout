import { Title, Flex, Text, Card, ActionIcon, ThemeIcon, Select, SegmentedControl, SimpleGrid, Divider, Box } from '@mantine/core';
import { useAuthSWR } from '@/utils/useAuthSWR'
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { IconBell, IconCheck, IconPencil } from '@tabler/icons-react';
import getFormData from '@/utils/getFormData'
import { notificationMap } from '@/utils/checks';
import { checkDefaultNotifications, checkNameMap } from '@statusscout/shared';
import NewNotificationChannelModal from '@/components/Notifications/NewNotificationChannelModal'

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

function NotificationSettings({ websiteId, children, noBorder }) {
  const [channelOpened, { open: openChannel, close: closeChannel }] = useDisclosure(false);
  const [channelLoading, setChannelLoading] = useState();
  const [onlyEmail, setOnlyEmail] = useState(false);
  const [edit, setEdit] = useState();
  const { data: websites = [], mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const { data: user = {} } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
  const website = websites.find(w => w.id === websiteId)
  const { data: flows = [] } = useAuthSWR(website?.index && `${import.meta.env.VITE_API_URL}/v1/flows?websiteId=${website.index}`)

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
    <Card withBorder={!noBorder} shadow={noBorder ? 'none' : 'md'}>
      <Card.Section p="md" withBorder={!noBorder}>
        {children}
      </Card.Section>
      <Card.Section p="md" withBorder={!noBorder}>

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
            description="Send notification once the issue is detected to:"
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
            description="Send daily summary of new issues via E-Mail to:"
            onlyEmail
            openChannel={() => {
              setOnlyEmail(true);
              openChannel()
            }}
          />
        </Card>

        <NewNotificationChannelModal
          opened={channelOpened}
          close={() => {
            closeChannel();
            setOnlyEmail(false);
          }}
          onlyEmail={onlyEmail}
        />
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
  )
}

export default NotificationSettings
