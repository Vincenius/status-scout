import { useEffect, useRef, useState } from 'react'
import { useLocation } from "react-router-dom";
import Layout from '@/components/Layout/Layout'
import { Blockquote, Box, Button, Card, List, Loader, Text, ThemeIcon, Title } from '@mantine/core'
import { IconCheck, IconSlash, IconX } from '@tabler/icons-react'
import Overview from '@/components/Dashboard/Overview';
import { trackEvent } from '@/utils/trackEvent'
import { useNavigate, Link } from 'react-router-dom'
import MockHistoryCharts from '@/components/Dashboard/MockHistoryCharts';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getStatusIcon = ({ isLoading, isError, isSkipped }) => {
  const iconSize = { width: '70%', height: '70%' };

  if (isLoading && !isSkipped) return <Loader size="xs" type="bars" />;
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
  const navigate = useNavigate();
  const id = query.get("id");
  const [url, setUrl] = useState();
  const [errorCount, setErrorCount] = useState(0);
  const [idError, setIdError] = useState();
  const [result, setResult] = useState({});
  const intervalRef = useRef(null);

  // init logic
  useEffect(() => {
    if (id) {
      fetch(`${import.meta.env.VITE_API_URL}/v1/quickcheck?id=${id}`)
        .then(res => res.json())
        .then(res => {
          if (res.error) {
            setIdError(true)
          } else {
            setResult(res)
            setUrl(res.url)
          }
        });
    } else {
      // redirect??
      navigate('/')
    }

  }, [id])

  // Polling logic
  useEffect(() => {
    // Start polling only if we have a quickcheckId and polling hasn't already started
    if (!result?.quickcheckId || result.state === 'completed' || intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/quickcheck?id=${result.quickcheckId}`);
        const data = await response.json();

        if (data.state === 'completed' || data.state === 'failed') {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          setResult(data);
          trackEvent('quickcheck-results', { url, state: data.state })
        } else {
          setResult(data);
        }
      } catch (error) {
        setErrorCount(errorCount + 1);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [result?.quickcheckId, result?.state]);


  if (idError) {
    return (
      <Layout title="Quick Check" hideNav={true}>
        <Box maw={1800} mx="auto" py="xl">
          <Card withBorder shadow="md" maw="600px" mx="auto" p="lg">
            <Title order={2} fw={500} mb="md">Couldn't find this Quickcheck.</Title>
            <Blockquote p="sm" mb="lg">
              It may have been removed. Quickchecks are automatically deleted after seven days.
            </Blockquote>

            <Button fullWidth component={Link} to="/" c="#fff">
              Start a New Quickcheck
            </Button>
          </Card>
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

  const allChecksCompleted = result.statusCode === 200 && result.state === 'completed'
  const isInQueue = quickcheckId && waitingIndex !== null
  const statusFailed = result.statusCode && result.statusCode !== 200
  const jobFailed = result.state === 'failed'

  return (
    <Layout title="Quick Check" hideNav={true}>
      <Box maw={1800} mx="auto">
        {!allChecksCompleted && <Card withBorder shadow="md" maw="600px" mx="auto">
          <Title mb="md" order={1} fw="normal">Running Health Check...</Title>

          <Text mb={isInQueue ? "xs" : "xl"}>Please wait while we perform our background checks. This won't take long.</Text>

          {isInQueue && <Blockquote mb="xl" p="md">
            <b>You’re in the Queue</b><br />
            Our system is handling a high volume of checks. Hang tight — your website health check will begin shortly.<br />
            <i>Current position in queue: #{waitingIndex + 1}</i>
          </Blockquote>}

          <List mb="md">
            <ListItem isLoading={!result.statusCode} isError={statusFailed}>
              Availability Status {statusFailed && `[Code ${result.statusCode}]`}
            </ListItem>
            <ListItem isLoading={!securityChecksComplete} isSkipped={statusFailed} isError={!securityChecksComplete && jobFailed}>
              Security Checks
            </ListItem>
            <ListItem isLoading={!seoChecksComplete} isSkipped={statusFailed} isError={!seoChecksComplete && jobFailed}>
              SEO Checks
            </ListItem>
            <ListItem isLoading={!a11yChecksComplete} isSkipped={statusFailed} isError={!securityChecksComplete && jobFailed}>
              Accessibility Checks
            </ListItem>
            <ListItem isLoading={!performanceChecksComplete} isSkipped={statusFailed} isError={!performanceChecksComplete && jobFailed}>
              Performance Checks
            </ListItem>
          </List>

          {jobFailed || errorCount > 5 && <Blockquote p="xs" color="red">
            An unexpected error occurred. Please try again or contact me: <a href="mailto:mail@vincentwill.com">mail@vincentwill.com</a>
          </Blockquote>}
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

          {/* <MockHistoryCharts /> */}
        </Box>}
      </Box>
    </Layout>
  )
}

export default QuickCheck
