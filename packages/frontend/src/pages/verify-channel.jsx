import { Link } from "react-router-dom";
import { Box, Button, Card, Flex, LoadingOverlay, PasswordInput, Text, Title } from '@mantine/core';
import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import getFormData from "@/utils/getFormData";

function VerifyChannel() {
	const token = new URLSearchParams(window.location.search).get("token");
	// TODO verify token with API
	// Show loading overlay while verifying

	return (
		<Layout title="Verify Channel" isPublicRoute redirectIfAuth>
			<LoadingOverlay visible={true} overlayBlur={2} />
		</Layout>
	);
}

export default VerifyChannel;
