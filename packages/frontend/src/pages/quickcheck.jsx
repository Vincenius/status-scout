import { useEffect, useRef, useState } from 'react'
import { useLocation } from "react-router-dom";
import Layout from '@/components/Layout/AppLayout'
import { Blockquote, Box, Button, Card, Flex, Loader, Overlay, Text, Title } from '@mantine/core'
import Overview from '@/components/Dashboard/Overview';
import { trackEvent } from '@/utils/trackEvent'
import { useNavigate, Link } from 'react-router-dom'
import MockHistoryCharts from '@/components/Dashboard/MockHistoryCharts';

function useQuery() {
  return new URLSearchParams(useLocation().search);
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
              It may have been removed. Quickcheck results are automatically deleted after seven days.
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
  const allChecksCompleted = result.statusCode === 200 && result.state === 'completed'
  const isInQueue = quickcheckId && waitingIndex !== null
  const statusFailed = result.statusCode && result.statusCode !== 200
  const jobFailed = result.state === 'failed'

  return (
    <Layout title="Quick Check" hideNav={true}>
      <Box maw={1800} mx="auto">
        <Box>
          <Title order={1} mb="md" fw="normal">Your Quickcheck Results:</Title>
          
          {isInQueue && <>
            <Overlay backgroundOpacity={0.45} blur={4} zIndex={200} />
            <Flex
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 201 }}
              w="100vw" h="100vh" align="center"
              p="md"
              bg=""
            >
              <Card withBorder shadow="md" mx="auto" p="md">
                <Flex gap="md" align="center" mb="md">
                  <Loader type="bars" size="sm" />
                  <Title order={2} size="h1" ta="center">You’re in the Queue</Title>
                </Flex>

                <Text size="xl" mb="md">Our system is handling a high volume of checks.<br />Hang tight — your website health check will begin shortly.</Text>
                <Text size="xl">Current position in queue: <b>#{waitingIndex + 1}</b></Text>
              </Card>
            </Flex>
          </>}
          
          <Overview
            data={{
              user: { domain: url },
              checks,
              allChecksCompleted,
              createdAt: result.createdAt,
            }}
            isLoading={false}
            isQuickCheck={true}
            allChecksCompleted={allChecksCompleted}
            hasFailed={jobFailed || errorCount > 5}
          />

          <MockHistoryCharts />
        </Box>
      </Box>
    </Layout>
  )
}

export default QuickCheck
