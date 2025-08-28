import Layout from '@/components/Layout/Layout'
import { Box, Flex } from '@mantine/core'
import Features from '@/components/Landing/Features';
import Hero from '@/components/Landing/Hero';
import SocialProof from '@/components/Landing/SocialProof';
import Roadmap from '@/components/Landing/Roadmap';

function QuickCheck() {
  return (
    <Layout title="Quick Check" >
      <Flex mx="auto" mih="80vh" align="center">
        <Hero />
      </Flex>

      <Features />

      {/* <SocialProof /> */}

      <Roadmap />

    </Layout>
  )
}

export default QuickCheck
