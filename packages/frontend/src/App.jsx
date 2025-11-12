import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import "./global.css";

import { useEffect } from "react";
import { Center, Loader, MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { theme } from "./theme";
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import TagManager from 'react-gtm-module'

const tagManagerArgs = {
  gtmId: import.meta.env.VITE_GTM_ID
}

if (import.meta.env.VITE_GTM_ID) {
  TagManager.initialize(tagManagerArgs)
}

function Redirect404() {
  useEffect(() => {
    window.location.replace("/404.html");
  }, []);
  return null;
}


function AppRoutes() {
  const element = useRoutes([
    ...routes,
    {
      path: "*",
      element: <Redirect404 />
    }
  ]);
  return element;
}

export default function App() {
  return <HelmetProvider>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-center" />
      <Suspense fallback={<Center h="100vh"><Loader /></Center>}>
        <AppRoutes />
      </Suspense>
    </MantineProvider>
  </HelmetProvider>;
}
