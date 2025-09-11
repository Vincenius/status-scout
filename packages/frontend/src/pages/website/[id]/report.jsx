import Layout from '@/components/Layout/Layout'
import { useParams } from 'react-router-dom';
import { Card, Container, LoadingOverlay, Text, Title } from '@mantine/core'
import { useAuthSWR } from '@/utils/useAuthSWR'
import Report from '@/components/Report/Report';
import { useEffect, useRef } from 'react';

function ReportPage() {
  const { id } = useParams();
  const intervalRef = useRef(null);
  const { data: websites = [], isLoading: isLoadingWebsites } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const website = websites.find(w => w.index === id)
  const { data: checkData = {}, isLoading: isLoadingChecks, mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/check?id=${id}`)

  const { checks = [], status = {} } = checkData

  useEffect(() => {
    // Start polling only if checks are not completed & polling hasn't already started
    if (status?.state === 'completed' || intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      try {
        mutate()
      } catch (error) {
        console.error('Error fetching check status:', error);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status?.state]);

  return (
    <Layout title="Website Report">
      <Container size="md" py="md">
        <Title size="h1" ta="center" mb="sm">Website Report</Title>

        {(isLoadingWebsites || isLoadingChecks) && <LoadingOverlay />}
        {!isLoadingWebsites && !website && <Card p="md" withBorder maw={600}>
          <Title order={2} mb="md">Website not found</Title>
          <Text>It looks like you're using an invalid URL. Please choose a valid website from the list in the navigation.</Text>
        </Card>}

        {/* todo waiting */}
        {!isLoadingWebsites && !isLoadingChecks && <>
          <Report
            website={website}
            checks={checks}
            createdAt={checks.length ? checks[0].createdAt : null}
          />
        </>}
      </Container>
    </Layout>
  )
}

export default ReportPage
