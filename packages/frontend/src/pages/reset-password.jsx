import { Box, Button, Card, Flex, PasswordInput, Text, Title } from '@mantine/core';
import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import getFormData from "@/utils/getFormData";
import InlineLink from "@/components/InlineLink/InlineLink";

function ResetPassword() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(false);

		const data = getFormData(e)

		fetch(`${import.meta.env.VITE_API_URL}/v1/reset-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				...data,
				token: new URLSearchParams(window.location.search).get("token"),
			}),
		}).then(res => {
			if (res.ok) {
				setSuccess(true);
			} else {
				setError("Could not send reset password. Your link is invalid or expired.");
			}
		}).finally(() => {
			setIsLoading(false);
		});
	};

	return (
		<Layout title="Reset Password" isPublicRoute redirectIfAuth>
			<Flex px="lg" py="3rem" align="center" justify="center">
				<Card shadow="md" padding="lg" radius="md" withBorder w="100%" maw="400px" pos="rel" style={{ overflow: "visible" }}>
					<Box>
						<Title ta="center" fw="lighter" mb="xl">Reset Password</Title>

						{success ? (
							<Text ta="center" mb="lg" c="green.7">
								Your password has been reset. You can now <InlineLink to="/login">login</InlineLink> with your new password.
							</Text>
						) : (
							<form onSubmit={handleSubmit}>
								<PasswordInput name="password" size="md" label="New password" description="Min. 8 characters" mb="md" required minLength={8} />

								<Button size="lg" mb={error ? "md" : "0"} fullWidth type="submit" loading={isLoading}>
									Set new password
								</Button>

								{error && <Text c="red">{error}</Text>}
							</form>
						)}
					</Box>

					<Text ta="center" mt="md">
						<InlineLink to="/login">Back to login</InlineLink>
					</Text>
				</Card>
			</Flex>
		</Layout>
	);
}

export default ResetPassword;
