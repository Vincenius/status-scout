import { Blockquote, List, Modal, Text } from "@mantine/core"
import recommendedHeaders from '@/utils/headers'

const modalTitleMap = {
  'performance': 'Performance',
  'fuzz': 'Exposed Sensitive Files',
  'headers': 'Missing Security Headers',
  'lighthouse': 'Lighthouse',
  'a11y': 'A11y',
  'seo': 'SEO',
}

const DetailsModal = ({ modal, setModal, recentHeaders, recentFuzz, user }) => {
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
    </Modal>
  )
}

export default DetailsModal