import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import Layout from '@/components/Layout/Layout';
import { theme } from "./theme";
import { Routes, Route } from 'react-router-dom';
import DashboardPage from '@/pages/Dashboard';
import SettingsPage from '@/pages/Settings';

export default function App() {
  return <MantineProvider theme={theme}>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </MantineProvider>;
}
