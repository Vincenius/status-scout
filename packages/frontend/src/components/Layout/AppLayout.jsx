import { Text, Flex, Burger, AppShell, NavLink, Box, Indicator } from '@mantine/core'
import { Helmet } from 'react-helmet-async';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconHeartbeat, IconLogout } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import ColorSchemeToggle from './ColorSchemeToggle.jsx';
import { useEffect } from 'react';

const Layout = ({ children, title, hideNav }) => {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

  // set head info on initial load
  useEffect(() => {
    if (isAnalyticsEnabled && !document.querySelector('[data-website-id]')) {
      const script = document.createElement('script');
      script.src = 'https://analytics.vincentwill.com/script.js';
      script.defer = true;
      script.setAttribute('data-website-id', 'a807669d-6eda-4c1c-9b36-2247d2caf318');
      document.head.appendChild(script);
    }
    if (document.title !== `${title} | ${import.meta.env.VITE_WEBSITE_NAME}`) {
      document.title = `${title} | ${import.meta.env.VITE_WEBSITE_NAME}`
    }
  });

  return <>
    <Helmet>
      <title>{`${title} | ${import.meta.env.VITE_WEBSITE_NAME}`}</title>
      {isAnalyticsEnabled && (<script defer src="https://analytics.vincentwill.com/script.js" data-website-id="a807669d-6eda-4c1c-9b36-2247d2caf318"></script>)}
    </Helmet>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: hideNav ? 0 : 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" h="100%" gap="lg">
          {!hideNav && <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />}
          <Flex justify="space-between" w="100%" px="md">
            <Indicator inline label="Beta" size={16}>
              <Flex gap="xs" align="center" component={Link} to="/" c="inherit" td="none">
                <IconHeartbeat size={26} stroke={0.8} />
                <Text size="xl" fw={200}>{import.meta.env.VITE_WEBSITE_NAME}</Text>
              </Flex>
            </Indicator>

            <ColorSchemeToggle />
          </Flex>
        </Flex>
      </AppShell.Header>

      {!hideNav && <AppShell.Navbar p="sm">
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
      </AppShell.Navbar>}

      <AppShell.Main>
        <Box pb="lg">
          {children}
        </Box>
      </AppShell.Main>

      <AppShell.Footer>
        <Flex py="xs" px="md" w="100%" justify="space-between">
          <Text size="sm" align="center">© {new Date().getFullYear()} {import.meta.env.VITE_WEBSITE_NAME}</Text>

          <Flex gap="sm">
            <Text size="sm" c="inherit"><Link to="/imprint">Imprint</Link></Text>
            <Text size="sm"><Link to="/privacy">Privacy</Link></Text>
          </Flex>
        </Flex>
      </AppShell.Footer>
    </AppShell>
  </>
}

export default Layout
