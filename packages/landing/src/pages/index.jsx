import Layout from '@/components/Layout/Layout'
import { Box, Flex } from '@mantine/core'
import Features from '@/components/Landing/Features';
import Hero from '@/components/Landing/Hero';
import SocialProof from '@/components/Landing/SocialProof';
import Roadmap from '@/components/Landing/Roadmap';
import Pricing from '@/components/Landing/Pricing';

function QuickCheck() {
  return (
    <Layout title="Your Website’s Health All in One Place" >
      <Flex mx="auto" mih="80vh" align="center">
        <Hero />
      </Flex>

      <Features />

      {/* <SocialProof /> */}

      <Pricing />

      <Roadmap />

    </Layout>
  )
}

export default QuickCheck
