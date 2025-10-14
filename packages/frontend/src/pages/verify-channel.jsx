import { LoadingOverlay } from '@mantine/core';
import { useEffect } from 'react';
import Layout from "@/components/Layout/Layout";
import { useNavigate } from 'react-router-dom';

function VerifyChannel() {
	const navigate = useNavigate();
	const token = new URLSearchParams(window.location.search).get("token");

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/v1/user/verify-channel`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token }),
		}).then(response => response.json())
			.then(data => {
				navigate("/settings?verifiedChannel=true", { replace: true });
			})
			.catch((error) => {
				navigate("/settings?verifiedChannel=false", { replace: true });
			});
	})

	return (
		<Layout title="Verify Channel" isPublicRoute>
			<LoadingOverlay visible={true} />
		</Layout>
	);
}

export default VerifyChannel;
