import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Flex, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react';
import Layout from "@/components/Layout/Layout";

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // todo redirect to dashboard if already logged in

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    setError(null)

    const formObject = {};
    const elements = e.target.elements;
    for (let element of elements) {
      if (element.name && element.value) {
        formObject[element.name] = element.value;
      }
    }

    fetch(`${import.meta.env.VITE_API_URL}/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formObject),
    }).then(res => {
      if (res.ok) {
        navigate("/dashboard");
      } else {
        setError("Wrong username or password")
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }


  return (
    <Layout title="Login" hideNav>
      <Flex px="lg" py="3rem" align="center" justify="center">
        <Card shadow="md" padding="lg" radius="md" withBorder w="100%" maw="400px" pos="rel" style={{ overflow: "visible" }}>

          <Box>
            <Title ta="center" fw="lighter" mb="xl">Login</Title>

            <form onSubmit={handleSubmit}>
              <TextInput name="username" size="md" placeholder="username" label="Username" mb="md" required />
              <TextInput name="password" size="md" label="Passwort" type="password" mb="lg" required />

              <Button size="lg" mb={error ? "md" : "0"} fullWidth type="submit" loading={isLoading}>Login</Button>

              {error && <Text c="red.9">{error}</Text>}
            </form>
          </Box>
        </Card>
      </Flex>
    </Layout>
  )
}

export default Login
