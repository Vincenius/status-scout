import { useEffect, useRef, useState } from 'react'
import { useForm } from '@mantine/form';
import { useLocation } from "react-router-dom";
import Layout from '@/components/Layout/Layout'
import { ActionIcon, Blockquote, Box, Card, Flex, List, Loader, Text, TextInput, ThemeIcon, Title } from '@mantine/core'
import { IconArrowRight, IconCheck, IconSlash, IconX } from '@tabler/icons-react'
import Overview from '@/components/Dashboard/Overview';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function isValidUrl(value) {
  try {
    const url = new URL(normalizeUrl(value));
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const hasValidHostname =
      /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) ||
      /^[\d.]+$/.test(url.hostname);

    return isHttp && hasValidHostname;
  } catch (_) {
    return false;
  }
}

function normalizeUrl(value) {
  // If user entered without scheme, default to https
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

const UrlInput = ({ handleChange }) => {
  const handleSubmit = ({ url }) => {
    const finalUrl = normalizeUrl(url.trim());
    const parsed = new URL(finalUrl);
    const baseUrl = parsed.origin;

    handleChange(baseUrl)
  };

  const form = useForm({
    initialValues: {
      url: '',
    },
    validate: {
      url: (value) => isValidUrl(value) ? null : 'Please enter a valid URL',
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Text size="xl">Enter your website URL to run a quick check:</Text>
      <Flex w="100%">
        <TextInput
          placeholder="https://www.yourdomain.com"
          size="xl"
          variant="filled"
          w="100%"
          {...form.getInputProps('url')}
          styles={{
            input: {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            },
          }}
        />
        <ActionIcon
          variant="filled"
          radius="md"
          type="submit"
          aria-label="Run Check"
          w={60}
          h={60}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <IconArrowRight stroke={1.5} />
        </ActionIcon>
      </Flex>
    </form>
  );
}

// api returns check or creates a new one with uuid
// uuid can be used to check status / waiting line
// check every 3 seconds for updated data

const getStatusIcon = ({ isLoading, isError, isSkipped }) => {
  const iconSize = { width: '70%', height: '70%' };

  if (isLoading) return <Loader size="xs" type="bars" />;
  if (isError)
    return (
      <ThemeIcon color="red" size="xs">
        <IconX style={iconSize} />
      </ThemeIcon>
    );
  if (isSkipped)
    return (
      <ThemeIcon color="gray" size="xs">
        <IconSlash style={iconSize} />
      </ThemeIcon>
    );
  return (
    <ThemeIcon color="green" size="xs">
      <IconCheck style={iconSize} />
    </ThemeIcon>
  );
};

const ListItem = ({ children, isLoading, isError, isSkipped }) => {
  return (
    <List.Item icon={getStatusIcon({ isLoading, isError, isSkipped })}>
      {children}
    </List.Item>
  )
}

function QuickCheck() {
  const query = useQuery();
  const encodedUrl = query.get("url");
  const decodedUrl = encodedUrl ? normalizeUrl(decodeURIComponent(encodedUrl)) : "";
  const [url, setUrl] = useState(decodedUrl);
  const [result, setResult] = useState({});
  const didMount = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (isValidUrl(url)) {
      fetch(`${import.meta.env.VITE_API_URL}/v1/quickcheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url }),
      }).then(res => res.json())
        .then(res => {
          setResult(res)
        })
    }
  }, [url]);

  // Polling logic
  useEffect(() => {
    // Start polling only if we have a quickcheckId and polling hasn't already started
    if (!result?.quickcheckId || result.completed || intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/quickcheck?id=${result.quickcheckId}`);
      const data = await response.json();

      if (data.completed) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        setResult(data);
      } else {
        setResult(data);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [result?.quickcheckId, result?.completed]);

  if (!isValidUrl(url)) {
    return (
      <Layout title="Quick Check" hideNav={true}>
        <Box withBorder shadow="md" maw="800px" mx="auto" py="xl">
          <Title mb="md" order={1} fw="normal">Check Your Website’s Health</Title>

          <UrlInput handleChange={val => setUrl(val)} />

          {url && <Text mt="md" c="red">{url} is not a valid URL</Text>}
        </Box>
      </Layout>
    )
  }

  const { checks = [], waitingIndex, quickcheckId } = result
  const securityChecksComplete =
    checks.find(check => check.check === 'headers') &&
    checks.find(check => check.check === 'ssl') &&
    checks.find(check => check.check === 'fuzz');
  const seoChecksComplete =
    checks.find(check => check.check === 'seo') &&
    checks.find(check => check.check === 'links')
  const a11yChecksComplete = checks.find(check => check.check === 'a11y')
  const performanceChecksComplete = checks.find(check => check.check === 'performance')

  const allChecksCompleted = result.statusCode === 200 && securityChecksComplete && seoChecksComplete && a11yChecksComplete && performanceChecksComplete
  const isInQueue = quickcheckId && waitingIndex !== null

  return (
    <Layout title="Quick Check" hideNav={true}>
      <Box maw={1800} mx="auto">
        {!allChecksCompleted && <Card withBorder shadow="md" maw="600px" mx="auto">
          <Title mb="md" order={1} fw="normal">Running Health Check...</Title>

          <Text mb={isInQueue ? "xs" : "xl"}>Please wait while we perform background checks for <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>. This won't take long.</Text>

          {isInQueue && <Blockquote mb="xl" p="md">
            <b>You’re in the Queue</b><br />
            Our system is handling a high volume of checks. Hang tight — your website health check will begin shortly.<br />
            <i>Current position in queue: #{waitingIndex + 1}</i>
          </Blockquote>}

          <List mb="md">
            <ListItem isLoading={!result.statusCode} isError={result.statusCode !== 200}>
              Availability Status {result.statusCode && result.statusCode !== 200 && `[Code ${result.statusCode}]`}
            </ListItem>
            <ListItem isLoading={!securityChecksComplete} isSkipped={result.statusCode !== 200}>
              Security Checks
            </ListItem>
            <ListItem isLoading={!seoChecksComplete} isSkipped={result.statusCode !== 200}>
              SEO Checks
            </ListItem>
            <ListItem isLoading={!a11yChecksComplete} isSkipped={result.statusCode !== 200}>
              Accessibility Checks
            </ListItem>
            <ListItem isLoading={!performanceChecksComplete} isSkipped={result.statusCode !== 200}>
              Performance Checks
            </ListItem>
          </List>

          <Blockquote p="xs">If the check is taking too long (2+ minutes), please send a bug report to: <a href="mailto:mail@vincentwill.com">mail@vincentwill.com</a></Blockquote>
        </Card>}

        {allChecksCompleted && <Box>
          <Title order={1} mb="md" fw="normal">Your Quickcheck Results:</Title>
          <Overview
            data={{
              user: { domain: url },
              checks
            }}
            isLoading={false}
            isQuickCheck={true}
          />
        </Box>}
      </Box>
    </Layout>
  )
}

export default QuickCheck
