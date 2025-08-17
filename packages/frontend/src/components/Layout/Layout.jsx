import { Text, Flex, Box, Indicator, Divider, ThemeIcon } from '@mantine/core'
import { Helmet } from 'react-helmet-async';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandBluesky, IconBrandGithub, IconHeartbeat, IconMug } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
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

    <Flex align="center" justify="space-between" h="100%" gap="lg" maw={1200} mx="auto" py="xs" px="xl">
      <Indicator inline label="Beta" size={16}>
        <Flex gap="xs" align="center" component={Link} to="/" c="inherit" td="none">
          <IconHeartbeat size={26} stroke={0.8} />
          <Text size="xl" fw={200}>{import.meta.env.VITE_WEBSITE_NAME}</Text>
        </Flex>
      </Indicator>

      <ColorSchemeToggle />
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
            <Text size="md" fw={200}>{import.meta.env.VITE_WEBSITE_NAME}</Text>
          </Flex>
          <Box>
            <Text size="sm" c="dimmed">Made and hosted in the EU 🇪🇺</Text>
            <Text size="sm" c="dimmed">Runs on renewable energy 🍃</Text>
          </Box>
        </Flex>

        <Flex gap="lg" direction="column">
          <Flex gap="sm" justify={{ base: 'center', xs: 'flex-end' }} wrap="wrap">
            <Text size="sm" c="inherit"><Link to="/imprint">Imprint</Link></Text>
            <Text size="sm"><Link to="/privacy">Privacy</Link></Text>
          </Flex>
          <Flex gap="sm" justify={{ base: 'center', xs: 'flex-end' }}>
            <a href="https://github.com/vincenius/status-scout" target="_blank" rel="noopener noreferrer">
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

      <Text size="sm" align="center" my="lg">© {new Date().getFullYear()} {import.meta.env.VITE_WEBSITE_NAME}</Text>
    </footer>
  </>
}

export default Layout
