import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Card, Checkbox, Flex, PasswordInput, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import getFormData from "@/utils/getFormData";

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // todo redirect to dashboard if already logged in (maybe in layout?)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    setError(null)

    const data = getFormData(e);

    fetch(`${import.meta.env.VITE_API_URL}/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (res.ok) {
        // login after register
        fetch(`${import.meta.env.VITE_API_URL}/v1/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }).then(() => {
          navigate("/confirm");
        })
      } else {
        if (res.status === 409) {
          setError("A user with this email address already exists.");
        } else {
          setError("Something went wrong. Please try again later or contact support.");
        }
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <Layout title="Register" isPublicRoute redirectIfAuth>
      <Flex px="lg" py="3rem" align="center" justify="center">
        <Card shadow="md" padding="lg" radius="md" withBorder w="100%" maw="400px" pos="rel" style={{ overflow: "visible" }}>
          <Box>
            <Title ta="center" fw="lighter" mb="xl">Register</Title>

            <form onSubmit={handleSubmit}>
              <TextInput name="email" size="md" placeholder="you@example.com" label="Email" mb="md" type="email" required />
              <PasswordInput name="password" size="md" label="Password" description="Min. 8 characters" mb="md" required minLength={8} />

              <Checkbox
                mb="lg"
                label={
                  <span>
                    I agree to the{' '} <a href="/terms" target="_blank" rel="noopener noreferrer"> Terms and Conditions</a>.
                  </span>
                }
                required
              />

              <Button size="lg" mb={error ? "md" : "0"} fullWidth type="submit" loading={isLoading}>Register</Button>

              {error && <Text c="red.9">{error}</Text>}
            </form>
            <Text ta="center" mt="md">
              Already have an account? <Link to="/login">Login</Link>
            </Text>
          </Box>
        </Card>
      </Flex>
    </Layout>
  )
}

export default Register;
