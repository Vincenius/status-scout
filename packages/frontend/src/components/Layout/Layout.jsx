import { Text, Flex, Burger, AppShell, NavLink, Box, Indicator, LoadingOverlay, Loader, ActionIcon, Menu, ScrollArea, Blockquote } from '@mantine/core'
import { Helmet } from 'react-helmet-async';
import { useDisclosure } from '@mantine/hooks';
import { IconAppWindow, IconCirclePlus, IconDashboard, IconHeartbeat, IconLogout, IconSettings } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import ColorSchemeToggle from './ColorSchemeToggle.jsx';
import { useEffect, useState } from 'react';
import { useAuthSWR } from '@/utils/useAuthSWR'
import FeedbackButton from '@/components/Feedbackbutton/Feedbackbutton.jsx';

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
  const expiresAt = new Date(user?.subscription?.expiresAt);
  const now = new Date();

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
      p="md"
    >
      <AppShell.Header px="md">
        <Flex align="center" h="100%" gap="lg">
          {!isPublicRoute && <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />}
          <Flex justify="space-between" w="100%">
            <Indicator inline label="Beta" size={16}>
              <Flex gap="xs" align="center" component={Link} to="/" c="inherit" td="none">
                <IconHeartbeat size={26} stroke={0.8} />
                <Text size="xl" fw={200}>StatusScout</Text>
              </Flex>
            </Indicator>

            <Flex gap="md">
              <ColorSchemeToggle />

              {user?.email && <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    aria-label="Settings"
                  >
                    <IconSettings stroke={1.5} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.email}</Menu.Label>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    to={`/settings`}
                    component={Link}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Item
                    disabled={logoutLoading}
                    leftSection={<IconLogout size={16} stroke={1.5} />}
                    onClick={async () => {
                      setLogoutLoading(true)
                      await fetch(`${import.meta.env.VITE_API_URL}/v1/logout`, { credentials: 'include' })
                      await new Promise(resolve => setTimeout(resolve, 500));
                      setLogoutLoading(false)
                      navigate('/login')
                    }}>
                    <span>Logout {logoutLoading ? <Loader size="xs" /> : ""}</span>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>}

            </Flex>
          </Flex>
        </Flex>
      </AppShell.Header>

      {!isPublicRoute && <AppShell.Navbar p="sm">
        <AppShell.Section grow component={ScrollArea}>
          <NavLink
            label="Dashboard"
            leftSection={<IconDashboard size={16} stroke={1.5} />}
            active={window.location.pathname === '/dashboard'}
            component={Link}
            disabled={!menuEnabled}
            to="/dashboard"
          />
          {websites.length > 0 && <Text size="sm" c="dimmed" mt="md" mb="xs" pl="sm">Websites</Text>}
          {websites.map(w => (
            <NavLink
              key={w.id}
              label={new URL(w?.domain).hostname}
              leftSection={<IconAppWindow size={16} stroke={1.5} />}
              disabled={!menuEnabled}
              defaultOpened={window.location.pathname.startsWith(`/website/${w.index}`)}
            >
              <NavLink
                label="Overview"
                to={`/website/${w.index}`}
                component={Link}
                active={window.location.pathname === `/website/${w.index}`}
              />
              <NavLink
                label="Report"
                to={`/website/${w.index}/report`}
                component={Link}
                active={window.location.pathname === `/website/${w.index}/report`}
              />
              {/* <NavLink
              to="/custom-flows"
              label="Custom Test Flows"
              leftSection={<IconReorder size={16} stroke={1.5} />}
              active={window.location.pathname === '/custom-flows'}
              component={Link}
            /> */}
              <NavLink
                label="Settings"
                to={`/website/${w.index}/settings`}
                component={Link}
                active={window.location.pathname === `/website/${w.index}/settings`}
              />
            </NavLink>
          ))}
          <NavLink
            label="Add Website"
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            active={window.location.pathname === '/website/new'}
            component={Link}
            disabled={!menuEnabled}
            to="/website/new"
          />
        </AppShell.Section>
        <AppShell.Section>
          {user?.subscription?.status === 'trial' && <Blockquote p="sm" mb="md">
            {expiresAt < now ? "Your free trial ended" : `Trial active until ${expiresAt.toLocaleDateString()}`}<br />
            <Link to="/checkout">Upgrade Plan</Link>
          </Blockquote>}
          <FeedbackButton fullWidth variant="outline">Feedback</FeedbackButton>
        </AppShell.Section>

        {/* Manual Tests */}
        {/* Alerts */}
      </AppShell.Navbar>}

      <AppShell.Main>
        <Box>
          {(isLoadingUser || isLoadingWebsite) && <LoadingOverlay />}
          {(!isLoadingUser && !isLoadingWebsite) && children}
        </Box>
      </AppShell.Main>
    </AppShell>
  </>
}

export default Layout
