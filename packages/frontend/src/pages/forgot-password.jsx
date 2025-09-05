import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Card, Flex, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import getFormData from "@/utils/getFormData";

function ForgotPassword() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(false);

		const data = getFormData(e)

		fetch(`${import.meta.env.VITE_API_URL}/v1/forgot-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(data),
		}).then(res => {
			if (res.ok) {
				setSuccess(true);
			} else {
				setError("Could not send reset email. Please try again.");
			}
		}).finally(() => {
			setIsLoading(false);
		});
	};

	return (
		<Layout title="Forgot Password" isPublicRoute redirectIfAuth>
			<Flex px="lg" py="3rem" align="center" justify="center">
				<Card shadow="md" padding="lg" radius="md" withBorder w="100%" maw="400px" pos="rel" style={{ overflow: "visible" }}>
					<Box>
						<Title ta="center" fw="lighter" mb="xl">Forgot Password</Title>

						{success ? (
							<Text ta="center" mb="lg" c="green.7">
								If an account with that email exists, a password reset link has been sent.
							</Text>
						) : (
							<form onSubmit={handleSubmit}>
								<TextInput name="email" type="email" size="md" placeholder="you@example.com" label="Email" mb="md" required />

								<Button size="lg" mb={error ? "md" : "0"} fullWidth type="submit" loading={isLoading}>
									Send reset link
								</Button>

								{error && <Text c="red.9">{error}</Text>}
							</form>
						)}
					</Box>

					<Text ta="center" mt="md">
						<Link to="/login">Back to login</Link>
					</Text>
				</Card>
			</Flex>
		</Layout>
	);
}

export default ForgotPassword;
