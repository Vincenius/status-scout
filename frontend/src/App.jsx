import "@mantine/core/styles.css";
import '@mantine/charts/styles.css';
import "./global.css";

import { Center, Loader, MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import { Suspense, lazy } from 'react';

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return <MantineProvider theme={theme} defaultColorScheme="auto">
    <Suspense fallback={<Center h="100vh"><Loader /></Center>}>
      <AppRoutes />
    </Suspense>
  </MantineProvider>;
}
