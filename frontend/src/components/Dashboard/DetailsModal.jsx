import { Blockquote, List, Modal, Popover, Spoiler, Table, Text, ThemeIcon, Accordion } from "@mantine/core"
import recommendedHeaders from '@/utils/headers'
import { IconQuestionMark } from "@tabler/icons-react"
import Markdown from 'react-markdown'

const modalTitleMap = {
  'performance': 'Performance',
  'fuzz': 'Exposed Sensitive Files',
  'headers': 'Missing Security Headers',
  'lighthouse': 'Lighthouse',
  'a11y': 'Accessibility Report',
  'seo': 'SEO Report',
  'custom': 'Custom Flows'
}

const MarkdownElem = ({ children }) => {
  return <Markdown components={{
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    p: ({ children }) => <Text size="sm" style={{ margin: '0' }}>{children}</Text>,
  }}>{children}</Markdown>
}

const DetailsModal = ({ modal, setModal, recentHeaders, recentFuzz, recentA11y, recentSeo, user }) => {
  // todo ignore list for headers & fuzz 
  return (
    <Modal opened={!!modal} onClose={() => setModal(null)} title={modalTitleMap[modal]} size="lg">
      {modal === 'headers' && <>
        <Blockquote color="indigo" mb="md" p="sm">
          For improved security, we recommend setting the following HTTP headers. These headers help protect your site against common web vulnerabilities and ensure better privacy and performance for your users.<br />The following headers are missing:
        </Blockquote>
        <List>
          {recentHeaders.result.details.missingHeaders.map((item, index) => (
            <List.Item key={index} mb="sm">
              <Text fw="bold">{item}</Text>
              <Text>{recommendedHeaders[item]}</Text>
            </List.Item>
          ))}
        </List>
      </>}
      {modal === 'fuzz' && <>
        <List>
          <Blockquote color="indigo" mb="md" p="sm">
            We’ve detected publicly accessible files that may expose sensitive information. These files should never be exposed to the web, as they can reveal secrets, internal configurations, or dependencies that attackers could exploit. Please restrict access or remove them from public view.
          </Blockquote>
          {recentFuzz.result.details.files.map((item, index) => (
            <List.Item key={index} mb="sm">
              <Text>
                <a href={`${user.domain}/${item}`} target="_blank" rel="noopener noreferrer">
                  {user.domain}/{item}
                </a>
              </Text>
            </List.Item>
          ))}
        </List>
      </>}
      {modal === 'a11y' && <>
        <Blockquote color="indigo" mb="md" p="sm">
          We’ve detected accessibility issues that can make it difficult for some users to navigate and use your website. These issues can exclude users and may lead to compliance risks. Please address them to improve inclusivity and usability for all visitors.
        </Blockquote>
        <Accordion variant="contained">
          {recentA11y.result.details.items.map((item, index1) => (
            <Accordion.Item key={`a11y-${index1}`} value={item.title}>
              <Accordion.Control>{item.title}</Accordion.Control>
              <Accordion.Panel>
                <Blockquote p="xs" mb="sm" color="gray"><MarkdownElem>{item.description}</MarkdownElem></Blockquote>
                <Table striped withTableBorder>
                  {item.items.map((item, index2) => <Table.Tr key={`a11y-${index1}-${index2}`}>
                    <Table.Td w={40}>{index2 + 1}</Table.Td>
                    <Table.Td>{item}</Table.Td>
                  </Table.Tr>)}
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </>}
      {modal === 'seo' && <>
        <Blockquote color="indigo" mb="md" p="sm">
          We’ve detected SEO issues that can make it harder for search engines to properly index and rank your website. These issues can limit your visibility in search results and reduce traffic. Please address them to improve your site’s discoverability and reach.
        </Blockquote>
        <Accordion variant="contained">
          {recentSeo.result.details.items.map((item, index1) => (
            <Accordion.Item key={`a11y-${index1}`} value={item.title}>
              <Accordion.Control>{item.title}</Accordion.Control>
              <Accordion.Panel>
                <Blockquote p="xs" mb="sm" color="gray"><MarkdownElem>{item.description}</MarkdownElem></Blockquote>
                <Table striped withTableBorder>
                  {item.items.map((item, index2) => <Table.Tr key={`a11y-${index1}-${index2}`}>
                    <Table.Td w={40}>{index2 + 1}</Table.Td>
                    <Table.Td>{item}</Table.Td>
                  </Table.Tr>)}
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </>}
      {modal === 'custom' && <>
        TODO
      </>}
    </Modal>
  )
}

export default DetailsModal