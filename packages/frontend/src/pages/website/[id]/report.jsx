import React from 'react'
import Layout from '@/components/Layout/Layout'
import { useParams } from 'react-router-dom';

function Report(props) {
  const { id } = useParams();
  console.log({ id });

  return (
    <Layout title="Website Report">
      <h1>Website Report for {id}</h1>
    </Layout>
  )
}

export default Report
