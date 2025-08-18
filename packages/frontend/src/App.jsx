import "@mantine/core/styles.css";
import '@mantine/charts/styles.css';
import "./global.css";

import { Center, Loader, MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import { useRoutes, Navigate } from 'react-router-dom';
import routes from '~react-pages';
import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';


function AppRoutes() {
  const element = useRoutes([
    ...routes,
    {
      path: "*",
      element: <Navigate to="/404.html" replace />
    }
  ]);
  return element;
}

export default function App() {
  return <HelmetProvider>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Suspense fallback={<Center h="100vh"><Loader /></Center>}>
        <AppRoutes />
      </Suspense>
    </MantineProvider>
  </HelmetProvider>;
}
