import { Text, Flex, Burger, AppShell, NavLink, Box, Indicator, LoadingOverlay, Loader } from '@mantine/core'
import { Helmet } from 'react-helmet-async';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconHeartbeat, IconLogout } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import ColorSchemeToggle from './ColorSchemeToggle.jsx';
import { useEffect, useState } from 'react';
import { useAuthSWR } from '@/utils/useAuthSWR'

const Layout = ({ children, title, isPublicRoute, redirectIfAuth }) => {
  const [opened, { toggle }] = useDisclosure();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || import.meta.env.VITE_ENABLE_ANALYTICS === true;
  const { data: user = {}, isLoading: isLoadingUser } = !isPublicRoute
    ? useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)
    : { data: {}, error: null, isLoading: false };
  const { data: websites = [], isLoading: isLoadingWebsite } = !isPublicRoute
    ? useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
    : { data: [], error: null, isLoading: false };

  const menuEnabled = user.confirmed && websites.length > 0;

  // set head info on initial load
  useEffect(() => {
    if (isAnalyticsEnabled && !document.querySelector('[data-website-id]')) {
      const script = document.createElement('script');
      script.src = 'https://analytics.vincentwill.com/script.js';
      script.defer = true;
      script.setAttribute('data-website-id', 'a807669d-6eda-4c1c-9b36-2247d2caf318');
      document.head.appendChild(script);
    }
    if (document.title !== `${title} | StatusScout`) {
      document.title = `${title} | StatusScout`
    }
  });

  useEffect(() => {
    if (redirectIfAuth) {
      fetch(`${import.meta.env.VITE_API_URL}/v1/authenticated`, { credentials: 'include' })
        .then(res => {
          if (res.status === 200) {
            navigate('/dashboard');
          }
        });
    }
  }, [navigate]);

  useEffect(() => {
    if (user.email && !user.confirmed && window.location.pathname !== '/confirm') {
      navigate('/confirm');
    }
    if (user.email && user.confirmed && !isLoadingWebsite && websites.length === 0 && window.location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [user, websites, isLoadingWebsite])

  return <>
    <Helmet>
      <title>{`${title} | StatusScout`}</title>
      {isAnalyticsEnabled && (<script defer src="https://analytics.vincentwill.com/script.js" data-website-id="a807669d-6eda-4c1c-9b36-2247d2caf318"></script>)}
    </Helmet>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: isPublicRoute ? 0 : 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" h="100%" gap="lg">
          {!isPublicRoute && <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />}
          <Flex justify="space-between" w="100%" px="md">
            <Indicator inline label="Beta" size={16}>
              <Flex gap="xs" align="center" component={Link} to="/" c="inherit" td="none">
                <IconHeartbeat size={26} stroke={0.8} />
                <Text size="xl" fw={200}>StatusScout</Text>
              </Flex>
            </Indicator>

            <ColorSchemeToggle />
          </Flex>
        </Flex>
      </AppShell.Header>

      {!isPublicRoute && <AppShell.Navbar p="sm">
        <NavLink
          label="Dashboard"
          leftSection={<IconDashboard size={16} stroke={1.5} />}
          active={window.location.pathname === '/'}
          component={Link}
          disabled={!menuEnabled}
        />
        <NavLink
          label={<span>Logout {logoutLoading ? <Loader size="xs" /> : ""}</span>}
          disabled={logoutLoading}
          leftSection={<IconLogout size={16} stroke={1.5} />}
          onClick={async () => {
            setLogoutLoading(true)
            await fetch(`${import.meta.env.VITE_API_URL}/v1/logout`, { credentials: 'include' })
            await new Promise(resolve => setTimeout(resolve, 500));
            setLogoutLoading(false)
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
        <Box>
          {(isLoadingUser || isLoadingWebsite) && <LoadingOverlay />}
          {(!isLoadingUser && !isLoadingWebsite) && children}
        </Box>
      </AppShell.Main>

      {/* <AppShell.Footer>
        <Flex py="xs" px="md" w="100%" justify="space-between">
          <Text size="sm" align="center">© {new Date().getFullYear()} StatusScout</Text>

          <Flex gap="sm">
            <Text size="sm" c="inherit"><Link to="/imprint">Imprint</Link></Text>
            <Text size="sm"><Link to="/privacy">Privacy</Link></Text>
          </Flex>
        </Flex>
      </AppShell.Footer> */}
    </AppShell>
  </>
}

export default Layout
