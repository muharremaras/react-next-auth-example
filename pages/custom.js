
import Layout from '../components/layout';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import Router from 'next/router';

export default function Page() {
  const [session, loading] = useSession();
  const [content, setContent] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/examples/protected');
      const json = await res.json();
      if (json.content) { setContent(json.content); }
    }
    fetchData()
  }, [session]);

  if (loading) return null;

  // If no session exists, display access denied message
  if (!session || session?.error) {
    Router.push({
      pathname: `${window.location.origin}/login`,
      query: { callbackUrl:window.location.href }
    })

    return null;
  }

  return (
    <Layout>
      <h2>Custom</h2>
      <p>{content}</p>
    </Layout>
  );
}