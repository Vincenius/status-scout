import "@mantine/core/styles.css";
import '@mantine/charts/styles.css';
import "./global.css";

import { Center, Loader, MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from "./pages/NotFound";

function AppRoutes() {
  return useRoutes([
    ...routes,
    { path: "*", element: <NotFound /> },
  ]);
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
