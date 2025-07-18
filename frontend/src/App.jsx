import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import Layout from '@/components/Layout/Layout';
import { theme } from "./theme";
import { Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import SettingsPage from '@/pages/Settings';
import CustomFlowsPage from '@/pages/CustomFlows';

export default function App() {
  return <MantineProvider theme={theme}>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/custom-flows" element={<CustomFlowsPage />} />
    </Routes>
  </MantineProvider>;
}
