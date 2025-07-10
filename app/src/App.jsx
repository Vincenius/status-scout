import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import Layout from '@/components/Layout/Layout';
import { theme } from "./theme";

export default function App() {
  return <MantineProvider theme={theme}>
    <Layout title="todo">
      heeey
    </Layout>
    hooo
  </MantineProvider>;
}
