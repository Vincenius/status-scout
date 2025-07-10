import React, { useEffect, useState } from 'react';
import { Container, Text, Flex, Box, Burger, Menu, AppShell, Title } from '@mantine/core'
import { Helmet } from 'react-helmet';
import styles from './Layout.module.css';
import { useDisclosure } from '@mantine/hooks';

const Layout = ({ children, title, description, date, noindex, image }) => {
  const ogImage = image || '/og-image.jpg';
  const setNoIndex = noindex || import.meta.env.VITE_NOINDEX === 'true';
  const [opened, { toggle }] = useDisclosure();

  return <>
    <Helmet>
      <title>{`${title} | ${import.meta.env.VITE_WEBSITE_NAME}`}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={import.meta.env.VITE_BASE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={import.meta.env.VITE_WEBSITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {date && <meta property="article:published_time" content={date}></meta>}
      {date && <meta name="author" content="Vincent Will"></meta>}
      {setNoIndex && <meta name="robots" content="noindex" />}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    </Helmet>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" ml="md" h="100%" gap="lg">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Title order={1} size="h3">{import.meta.env.VITE_WEBSITE_NAME}</Title>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  </>
}

export default Layout
