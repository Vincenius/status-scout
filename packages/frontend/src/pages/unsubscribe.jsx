import { LoadingOverlay, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import Layout from "@/components/Layout/Layout";

function Unsubscribe() {
	const id = new URLSearchParams(window.location.search).get("id");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/v1/user/unsubscribe`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id }),
		}).then(() => setLoading(false))
	})

	return (
		<Layout title="Unsubscribe" isPublicRoute>
			<LoadingOverlay visible={loading} />
			<Title order={2} align="center" mt="xl">You have been successfully unsubscribed</Title>
		</Layout>
	);
}

export default Unsubscribe;
