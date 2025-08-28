import Layout from '@/components/Layout/Layout'
import { Box, Flex, Loader, LoadingOverlay } from '@mantine/core'

function IndexPage() {
  // if authenticated -> /dashboard
  // else /login

  return (
    <Layout title="Login" hideNav>
      <LoadingOverlay visible overlayBlur={2} />
    </Layout>
  )
}

export default IndexPage
