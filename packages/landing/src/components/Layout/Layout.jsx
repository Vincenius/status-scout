import { Text, Flex, Box, Divider, ThemeIcon, Button, Menu, Burger } from '@mantine/core'
import { Helmet } from 'react-helmet-async';
import { IconBrandBluesky, IconBrandGithub, IconHeartbeat, IconMug } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import ColorSchemeToggle from './ColorSchemeToggle.jsx';
import { useEffect, useState } from 'react';
import InlineLink from '@/components/InlineLink/InlineLink.jsx';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, title }) => {
  const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || import.meta.env.VITE_ENABLE_ANALYTICS === true;
  const [opened, setOpened] = useState(false);
  const location = useLocation();

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

  // gtag
  useEffect(() => {
    if (!import.meta.env.VITE_GTM_ID) return;

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GTM_ID}`;
    script.async = true;
    document.head.appendChild(script);

    const cookieScript = document.createElement('script');
    cookieScript.src = 'https://consent.cookiebot.com/uc.js';
    cookieScript.setAttribute('data-cbid', import.meta.env.VITE_COOKIEBOT_ID);
    cookieScript.type = 'text/javascript';
    cookieScript.async = true;
    document.head.appendChild(cookieScript);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GTM_ID);

    return () => {
      // optional cleanup if you want to remove it later
      document.head.removeChild(script);
    };
  }, []);

  // handle gtag location changes
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GTM_ID, {
        page_path: window.location.pathname,
      });
    }
  }, [location.pathname]);

  return <>
    <Helmet>
      <title>{`${title} | StatusScout`}</title>
      {isAnalyticsEnabled && (<script defer src="https://analytics.vincentwill.com/script.js" data-website-id="a807669d-6eda-4c1c-9b36-2247d2caf318"></script>)}
    </Helmet>

    <Flex align="center" justify="space-between" h="100%" gap="lg" maw={1200} mx="auto" py="xs" px="xl">
      <Flex gap="xs" align="center" component={Link} to="/" c="inherit" td="none">
        <IconHeartbeat size={26} stroke={0.8} />
        <Text size="xl" fw={200}>StatusScout</Text>
      </Flex>

      <Flex gap="md" align="center">
        <Flex gap="md" display={{ base: 'none', xs: 'flex' }}>
          <Button size="xs" component="a" href={`${import.meta.env.VITE_APP_URL}/login`} variant="outline">
            Login
          </Button>
          <Button size="xs" component="a" href={`${import.meta.env.VITE_APP_URL}/register`}>
            Sign-up
          </Button>
        </Flex>

        <ColorSchemeToggle />

        <Menu shadow="md" width={200} display={{ base: 'block', xs: 'none' }} opened={opened} onChange={setOpened}>
          <Menu.Target>
            <Burger opened={opened} aria-label="Toggle navigation" />
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item>
              <Button size="xs" component="a" href={`${import.meta.env.VITE_APP_URL}/login`} variant="outline" fullWidth>
                Login
              </Button>
            </Menu.Item>
            <Menu.Item>
              <Button size="xs" component="a" href={`${import.meta.env.VITE_APP_URL}/register`} fullWidth>
                Sign-up
              </Button>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </Flex>

    <Divider my="0" />

    <Box px="xl" maw={1200} mx="auto" mih="80vh" style={{ position: 'relative' }}>
      {children}
    </Box>

    <Divider mb="1em" />

    <footer>
      <Flex py="xs" px="xl" w="100%" maw={1200} mx="auto" justify="space-between" direction={{ base: 'column', xs: 'row' }} gap={{ base: 'xl', xs: 'md' }}>
        <Flex gap="md" direction="column" align={{ base: 'center', xs: 'flex-start' }}>
          <Flex gap="xs" align="center" component={Link} to="/" c="inherit" td="none">
            <IconHeartbeat size={20} stroke={0.8} />
            <Text size="md" fw={200}>StatusScout</Text>
          </Flex>
          <Box>
            <Text size="sm">Made and hosted in the EU 🇪🇺</Text>
            <Text size="sm">Runs on renewable energy 🍃</Text>
          </Box>
        </Flex>

        <Flex gap="lg" direction="column">
          <Flex gap="sm" justify={{ base: 'center', xs: 'flex-end' }} wrap="wrap">
            <Text size="sm" c="inherit"><InlineLink to="/imprint">Imprint</InlineLink></Text>
            <Text size="sm"><InlineLink to="/privacy">Privacy</InlineLink></Text>
          </Flex>
          <Flex gap="sm" justify={{ base: 'center', xs: 'flex-end' }}>
            <a href="https://github.com/vincenius/statusscout" target="_blank" rel="noopener noreferrer">
              <ThemeIcon variant="light" size="lg" aria-label="GitHub">
                <IconBrandGithub size={20} />
              </ThemeIcon>
            </a>
            <a href="https://bsky.app/profile/vincentwill.com" target="_blank" rel="noopener noreferrer">
              <ThemeIcon variant="light" size="lg" aria-label="Bluesky">
                <IconBrandBluesky size={20} />
              </ThemeIcon>
            </a>
            <a href="https://ko-fi.com/wweb_dev" target="_blank" rel="noopener noreferrer">
              <ThemeIcon variant="light" size="lg" aria-label="Bluesky">
                <IconMug size={20} />
              </ThemeIcon>
            </a>
          </Flex>
        </Flex>
      </Flex>

      <Text size="sm" align="center" my="lg">© {new Date().getFullYear()} StatusScout</Text>
    </footer>
  </>
}

export default Layout
