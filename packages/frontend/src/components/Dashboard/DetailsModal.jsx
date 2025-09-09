import { Blockquote, List, Modal, Table, Text, Accordion, Badge, ActionIcon, Button, Textarea, TextInput } from "@mantine/core"
import recommendedHeaders from '@/utils/headers'
import { IconBell, IconBellOff } from "@tabler/icons-react"
import Markdown from 'react-markdown'
import { useState } from "react"
import { useSWRConfig } from 'swr'

const modalTitleMap = {
  'performance': 'Performance',
  'fuzz': 'Exposed Sensitive Files',
  'headers': 'Missing Security Headers',
  'lighthouse': 'Lighthouse',
  'a11y': 'Accessibility Report',
  'seo': 'SEO Report',
  'custom': 'Custom Flows',
  'links': 'Broken Links',
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

const LinksTable = ({ items, updateIgnoreList, loading, ignoreAction }) => {
  if (!items.length) {
    return <Text fs="italic" ta="center" my="xl">No broken links found</Text>
  }

  return <Table striped withTableBorder>
    <Table.Thead>
      <Table.Tr>
        <Table.Td>Status</Table.Td>
        <Table.Td>Broken Link</Table.Td>
        <Table.Td>Parent</Table.Td>
        {/* <Table.Td>{ignoreAction === 'add' ? 'Ignore' : 'Unignore'}</Table.Td> */}
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {items.map((item, index) => <Table.Tr key={`links-${index}`}>
        <Table.Td w={70}><Badge color={item.status === 404 ? 'orange' : 'red'}>{item.status}</Badge></Table.Td>
        <Table.Td><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></Table.Td>
        <Table.Td><a href={item.parent} target="_blank" rel="noopener noreferrer">{item.parent}</a></Table.Td>
        {/* <Table.Td align="center">
          <ActionIcon
            variant="outline"
            aria-label="Ignore Item"
            onClick={() => updateIgnoreList({ item, type: 'links', action: ignoreAction })}
            loading={loading === item.url}
            disabled={loading && loading !== item.url}
          >
            {ignoreAction === 'add'
              ? <IconBellOff style={{ width: '70%', height: '70%' }} stroke={1.5} />
              : <IconBell style={{ width: '70%', height: '70%' }} stroke={1.5} />}
          </ActionIcon>
        </Table.Td> */}
      </Table.Tr>)}
    </Table.Tbody>
  </Table>
}

const DetailsModal = ({
  modal,
  setModal,
  recentHeaders,
  recentFuzz,
  recentA11y,
  recentSeo,
  recentLinks,
  user
}) => {
  const [loading, setLoading] = useState(null)
  const [showIgnored, setShowIgnored] = useState(false)
  const { mutate } = useSWRConfig()
  const { ignore = [] } = user

  const updateIgnoreList = async ({ item, type, action }) => {
    setLoading(item.url)

    fetch(`${import.meta.env.VITE_API_URL}/v1/website/ignore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ item: item.url, type, action }),
    }).then(async res => {
      mutate(`${import.meta.env.VITE_API_URL}/v1/website`)
    }).finally(() => {
      setLoading(null)
    })
  }

  return (
    <Modal opened={!!modal} onClose={() => setModal(null)} title={modalTitleMap[modal]} size="xl">
      {modal === 'headers' && <>
        <Blockquote color="indigo" mb="md" p="sm">
          For improved security, we recommend setting the following HTTP headers. These headers help protect your site against common web vulnerabilities and ensure better privacy and performance for your users.<br />The following headers are missing:
        </Blockquote>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Td>Header</Table.Td>
              <Table.Td>Explanation</Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recentHeaders.result.details.missingHeaders.map((item, index) => (
              <Table.Tr key={`header-${index}`}>
                <Table.Td><Text fw="bold">{item}</Text></Table.Td>
                <Table.Td><Text>{recommendedHeaders[item]}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </>}
      {modal === 'fuzz' && <>
        <Blockquote color="indigo" mb="md" p="sm">
          We’ve detected publicly accessible files that may expose sensitive information. These files should never be exposed to the web, as they can reveal secrets, internal configurations, or dependencies that attackers could exploit. Please restrict access or remove them from public view.
        </Blockquote>
        <List>
          {recentFuzz.result.details.files.map((item, index) => (
            <List.Item key={index} mb="sm">
              <Text>
                <a href={`${user.domain}/${item.file}`} target="_blank" rel="noopener noreferrer">
                  {user.domain}/{item.file}
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
                  <Table.Tbody>
                    {item.items.map((item, index2) => <Table.Tr key={`a11y-${index1}-${index2}`}>
                      <Table.Td w={40}>{index2 + 1}</Table.Td>
                      <Table.Td>{item}</Table.Td>
                    </Table.Tr>)}
                  </Table.Tbody>
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
                  <Table.Tbody>
                    {item.items.map((item, index2) => <Table.Tr key={`a11y-${index1}-${index2}`}>
                      <Table.Td w={40}>{index2 + 1}</Table.Td>
                      <Table.Td>{item}</Table.Td>
                    </Table.Tr>)}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </>}
      {modal === 'links' && <>
        <Blockquote color="indigo" mb="md" p="sm">
          We’ve detected broken links on your website that lead to missing or unavailable pages. These links can hurt user experience and negatively impact SEO.
        </Blockquote>

        <Text mb="md">
          For now the Quick Check is limited to a <b>maximum of 200 scanned links</b> to ensure fast results for everyone. A more comprehensive scan will be available soon.
        </Text>

        <List>
          <LinksTable
            items={recentLinks.result.details.filter(item => !ignore.map(i => i.item).includes(item.url))}
            updateIgnoreList={updateIgnoreList}
            loading={loading}
            ignoreAction="add"
          />

          {ignore.length > 0 &&
            <>
              {!showIgnored && <Text mt="sm">
                <a size="sm" mt="sm" variant="transparent" href="#show-ignored" onClick={e => { e.preventDefault(); setShowIgnored(true) }}>
                  Show {ignore.length} filtered {ignore.length === 1 ? 'item' : 'items'}
                </a>
              </Text>}
              {showIgnored && <>
                <Text mt="sm" mb="xs" fw="bold">Filtered Items</Text>
                <LinksTable
                  items={ignore.map(i => recentLinks.result.details.find(item => item.url === i.item))}
                  updateIgnoreList={updateIgnoreList}
                  loading={loading}
                  ignoreAction="remove"
                />
              </>}
            </>
          }
        </List>
      </>}
      {modal === 'custom' && <>
        TODO
      </>}
    </Modal>
  )
}

export default DetailsModal