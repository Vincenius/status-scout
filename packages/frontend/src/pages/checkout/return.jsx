import { LoadingOverlay } from '@mantine/core';
import { useEffect } from 'react';
import Layout from "@/components/Layout/Layout";
import { useNavigate } from 'react-router-dom';
import { useAuthSWR } from '@/utils/useAuthSWR'

function VerifyChannel() {
  const navigate = useNavigate();
  const session_id = new URLSearchParams(window.location.search).get("session_id");
  const { mutate } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)

  useEffect(() => {
    if (session_id) {
      fetch(`${import.meta.env.VITE_API_URL}/v1/checkout/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id }),
      }).then(response => response.json())
        .then(data => {
          mutate()
          navigate("/dashboard?subscription=true", { replace: true });
        })
        .catch((error) => {
          navigate("/dashboard?subscription=false", { replace: true });
        });
    }
  }, [session_id])

  return (
    <Layout title="Checkout">
      <LoadingOverlay visible={true} />
    </Layout>
  );
}

export default VerifyChannel;
