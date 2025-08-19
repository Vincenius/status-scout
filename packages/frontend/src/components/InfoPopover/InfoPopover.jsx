import { Popover, Text, ThemeIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks';
import { IconInfoSmall } from '@tabler/icons-react'

const InfoPopover = ({ infoText }) => {
  const [opened, { close, open }] = useDisclosure(false);

  return <Popover width={300} position="bottom" withArrow shadow="md" opened={opened}>
    <Popover.Target>
      <ThemeIcon
        variant="outline"
        radius="xl"
        size="14px"
        style={{ cursor: 'pointer' }}
        onMouseEnter={open}
        onMouseLeave={close}
        onClick={() => {
          if (opened) close();
          else open();
        }}
      >
        <IconInfoSmall width="100%" height="100%" />
      </ThemeIcon>
    </Popover.Target>
    <Popover.Dropdown>
      <Text size="sm">{infoText}</Text>
    </Popover.Dropdown>
  </Popover>
}

export default InfoPopover
