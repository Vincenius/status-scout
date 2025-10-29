import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Card, Flex, PasswordInput, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import getFormData from "@/utils/getFormData";
import InlineLink from "@/components/InlineLink/InlineLink";

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    setError(null)

    const data = getFormData(e)

    fetch(`${import.meta.env.VITE_API_URL}/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    }).then(res => {
      if (res.ok) {
        navigate("/dashboard");
      } else {
        setError("Wrong email or password")
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }


  return (
    <Layout title="Login" isPublicRoute redirectIfAuth>
      <Flex px="lg" py="3rem" align="center" justify="center">
        <Card shadow="md" padding="lg" radius="md" withBorder w="100%" maw="400px" pos="rel" style={{ overflow: "visible" }}>
          <Box>
            <Title ta="center" fw="lighter" mb="xl">Login</Title>

            <form onSubmit={handleSubmit}>
              <TextInput name="email" size="md" placeholder="you@example.com" label="Email" mb="md" required />
              <PasswordInput name="password" size="md" label="Password" type="password" mb="xs" required />

              <Text size="xs" mb="lg"><InlineLink to="/forgot-password">Forgot password?</InlineLink></Text>

              <Button size="lg" mb={error ? "md" : "0"} fullWidth type="submit" loading={isLoading}>Login</Button>

              {error && <Text c="red">{error}</Text>}
            </form>
          </Box>

          {(import.meta.env.VITE_DISABLE_REGISTRATION !== 'true' && import.meta.env.VITE_DISABLE_REGISTRATION !== true) && (
            <>
              <Text ta="center" mt="md">
                Don't have an account? <InlineLink to="/register">Register</InlineLink>
              </Text>
            </>

          )}
        </Card>
      </Flex>
    </Layout>
  )
}

export default Login
