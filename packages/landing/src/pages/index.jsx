import Layout from '@/components/Layout/Layout'
import { Box, Flex } from '@mantine/core'
import Features from '@/components/Landing/Features';
import Hero from '@/components/Landing/Hero';
import SocialProof from '@/components/Landing/SocialProof';
import Roadmap from '@/components/Landing/Roadmap';
import Pricing from '@/components/Landing/Pricing';
import { Helmet } from 'react-helmet-async';

function QuickCheck() {
  return (
    <Layout title="Quick Check" >
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
