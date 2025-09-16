import Layout from '@/components/Layout/Layout';
import { useState, useEffect } from 'react';
import CreateWebsite from '@/components/CreateWebsite/CreateWebsite';

function Onboarding() {
  const { data: websites = [] } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  useEffect(() => {
    if (websites.length) {
      navigate('/dashboard');
    }
  }, [websites]);

  return (
    <Layout title="Onboarding">
      <CreateWebsite title="Add your first website" />
    </Layout>
  );
}

export default Onboarding;
