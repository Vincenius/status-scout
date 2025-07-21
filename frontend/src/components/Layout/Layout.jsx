import { Text, Flex, Burger, AppShell, NavLink } from '@mantine/core'
import { Helmet } from 'react-helmet';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconHeartbeat, IconLogout } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import ColorSchemeToggle from './ColorSchemeToggle.jsx';

const Layout = ({ children, title, description, date, noindex, image }) => {
  const ogImage = image || '/og-image.jpg';
  const setNoIndex = noindex || import.meta.env.VITE_NOINDEX === 'true';
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();

  return <>
    <Helmet>
      <title>{`${title} | ${import.meta.env.VITE_WEBSITE_NAME}`}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={import.meta.env.VITE_BASE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={import.meta.env.VITE_WEBSITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {date && <meta property="article:published_time" content={date}></meta>}
      {date && <meta name="author" content="Vincent Will"></meta>}
      {setNoIndex && <meta name="robots" content="noindex" />}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    </Helmet>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" ml="md" h="100%" gap="lg">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Flex justify="space-between" w="100%" px="md">
            <Flex gap="xs" align="center">
              <IconHeartbeat size={26} stroke={0.8} />
              <Text size="xl" fw={200}>{import.meta.env.VITE_WEBSITE_NAME}</Text>
            </Flex>


            <ColorSchemeToggle />
          </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          leftSection={<IconDashboard size={16} stroke={1.5} />}
          active={window.location.pathname === '/'}
          component={Link}
        />
        <NavLink
          label="Logout"
          leftSection={<IconLogout size={16} stroke={1.5} />}
          onClick={async () => {
            await fetch(`${import.meta.env.VITE_API_URL}/v1/logout`, { credentials: 'include' })
            navigate('/login')
          }}
        />
        {/* <NavLink
          to="/custom-flows"
          label="Custom Test Flows"
          leftSection={<IconReorder size={16} stroke={1.5} />}
          active={window.location.pathname === '/custom-flows'}
          component={Link}
        /> */}
        {/* Manual Tests */}
        {/* Alerts */}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  </>
}

export default Layout
