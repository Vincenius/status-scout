import Layout from '@/components/Layout/Layout';
import { Container, Title, Text, Center, Card, ThemeIcon, Flex, Button } from '@mantine/core';
import { useCallback, useEffect, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useAuthSWR } from '@/utils/useAuthSWR'
import { useNavigate } from 'react-router-dom';

// todo dark mode
// https://docs.stripe.com/connect/embedded-appearance-support-dark-mode
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Checkout() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState();
  const { data: user, isLoading } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/user`)

  const plans = {
    monthly: { label: 'Monthly', pricePerMonth: 15, billing: 'monthly' },
    yearly: { label: 'Yearly', pricePerMonth: 12, billing: 'yearly' },
  };

  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session for selected plan
    return fetch(`${import.meta.env.VITE_API_URL}/v1/checkout/session`, {
      method: "POST",
      body: JSON.stringify({ type: selectedPlan }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, [selectedPlan]);

  const options = { fetchClientSecret };

  const monthly = plans.monthly;
  const yearly = plans.yearly;
  const savings = ((monthly.pricePerMonth - yearly.pricePerMonth) / monthly.pricePerMonth) * 100;

  useEffect(() => {
    if (user?.subscription?.plan === 'pro' && !user?.subscription?.expiresAt) {
      navigate('/settings');
    }
  }, [user]);

  return (
    <Layout title="Checkout">
      <Container size="lg" py={40}>
        {!selectedPlan && <>
          <Title order={2} align="center" mb="xl">Choose your plan</Title>
          <Flex gap="xl" justify="center" maw={600} mx="auto">
            <Card shadow="sm" padding="lg" radius="md" withBorder w="100%" style={{ cursor: 'pointer' }} onClick={() => setSelectedPlan('monthly')}>
              <ThemeIcon size="xl">M</ThemeIcon>
              <Title order={4} mt="sm">{monthly.label}</Title>
              <Text size="lg"><b>${monthly.pricePerMonth}</b>/month</Text>
              <Text size="sm" c="dimmed">Billed monthly</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder w="100%" style={{ cursor: 'pointer', borderColor: 'var(--mantine-primary-color-6)' }} onClick={() => setSelectedPlan('yearly')}>
              <ThemeIcon size="xl">Y</ThemeIcon>
              <Title order={4} mt="sm">{yearly.label}</Title>
              <Text size="lg"><b>${yearly.pricePerMonth}</b>/month</Text>
              <Text size="sm" c="dimmed">Billed yearly — saves {Math.round(savings)}%</Text>
            </Card>
          </Flex>
        </>}

        {selectedPlan && <>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={options}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>

          <Flex justify="center" mt="xl">
            <Button variant="outline" mx="auto" onClick={() => setSelectedPlan(null)}>Back to plan selection</Button>
          </Flex>
        </>}
      </Container>
    </Layout>
  );
}

export default Checkout;
