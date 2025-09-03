import Layout from '@/components/Layout/Layout'
import { LoadingOverlay } from '@mantine/core'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/v1/authenticated`, { credentials: 'include' })
      .then(res => {
        if (res.status === 200) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      });
  }, [navigate]);

  return (
    <Layout title="Login" isPublicRoute>
      <LoadingOverlay visible />
    </Layout>
  )
}

export default IndexPage
