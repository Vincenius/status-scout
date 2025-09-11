import { Blockquote, Box, Card, Center, Flex, Table, Text, ThemeIcon, Title } from '@mantine/core'
import {
  SSLChart,
  HeaderChart,
  FuzzChart,
  PerformanceChart,
  SEOChart,
  BrokenLinksChart,
  AccessibilityChart
} from './ResultCharts'
import { getRecentChecks } from '@/utils/checks'
import recommendedHeaders from '@/utils/headers'

function Report({ website, checks, createdAt }) {
  const {
    performanceCheck,
    fuzzCheck,
    headersCheck,
    sslCheck,
    a11yCheck,
    seoCheck,
    linkCheck,
    customChecks, // todo
  } = getRecentChecks(checks)

  const performances = [
    performanceCheck?.result?.details?.desktopResult?.LCP?.category,
    performanceCheck?.result?.details?.desktopResult?.INP?.category,
    performanceCheck?.result?.details?.desktopResult?.CLS?.category,
    performanceCheck?.result?.details?.mobileResult?.LCP?.category,
    performanceCheck?.result?.details?.mobileResult?.INP?.category,
    performanceCheck?.result?.details?.mobileResult?.CLS?.category,
  ].filter(Boolean)

  const brokenLinks = linkCheck && linkCheck.result.details // .filter(link => !ignore.filter(i => i.type === 'links').map(i => i.item).includes(link.url))

  return (
    <div>
      <Text size="lg" ta="center">For <a href={website?.domain} target='_blank' rel="noopener noreferrer">{new URL(website?.domain).hostname}</a> from <i>{new Date(createdAt).toLocaleString()}</i></Text>

      <Card p="md" withBorder shadow="md" mt="xl">
        <Card.Section withBorder p="md" mb="md">
          <Flex gap="md" justify="space-around" wrap="wrap">
            <Flex direction="column" align="center">
              <SSLChart status={sslCheck.result.status} />
            </Flex>
            <Flex direction="column" align="center">
              <HeaderChart status={headersCheck.result.status} missingHeaders={headersCheck.result.details.missingHeaders} />
            </Flex>
            {/* TODO DNS CHECK here */}
            <Flex direction="column" align="center">
              <FuzzChart status={fuzzCheck.result.status} files={fuzzCheck.result.details.files} />
            </Flex>
            <Flex direction="column" align="center">
              <PerformanceChart performances={performances} />
            </Flex>

            <Flex direction="column" align="center">
              <SEOChart score={seoCheck.result.details.score} />
            </Flex>

            <Flex direction="column" align="center">
              <BrokenLinksChart brokenLinks={brokenLinks} />
            </Flex>

            <Flex direction="column" align="center">
              <AccessibilityChart score={a11yCheck.result.details.score} />
            </Flex>
          </Flex>
        </Card.Section>
        <Card.Section withBorder p="md">
          <SSLChart status={sslCheck.result.status} size="lg" />
          {sslCheck.result.status === 'success' && <Text size="md" ta="center" fs="italic">Valid until {new Date(sslCheck.result.details.validTo).toLocaleDateString()}</Text>}

          <Blockquote p="md" my="md" maw={600} mx="auto">An SSL certificate ensures encrypted data transmission, signals trust to users with the padlock symbol, and may enhance search engine rankings.</Blockquote>

        </Card.Section>
        <Card.Section withBorder p="md">
          <HeaderChart status={headersCheck.result.status} missingHeaders={headersCheck.result.details.missingHeaders} size="lg" />
          {headersCheck.result.details.missingHeaders.length === 0 && <Text size="md" ta="center" fs="italic">All important security headers are present.</Text>}

          <Blockquote p="md" my="md" maw={600} mx="auto">HTTP security headers help protect websites from common attacks, strengthen user trust, and can improve security compliance.</Blockquote>

          {headersCheck.result.details.missingHeaders.length > 0 && <>
            <Text size="md" mb="sm" mt="xl" fs="italic">The following recommended headers are missing:</Text>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Td>Header</Table.Td>
                  <Table.Td>Explanation</Table.Td>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {headersCheck.result.details.missingHeaders.map((item, index) => (
                  <Table.Tr key={`header-${index}`}>
                    <Table.Td><Text fw="bold">{item}</Text></Table.Td>
                    <Table.Td><Text>{recommendedHeaders[item]}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>}
        </Card.Section>
      </Card>
    </div>
  )
}

export default Report
