import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import ChatBox from '../components/ChatBox';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

export default function ChatPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_evt, s) =>
      setSession(s)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <Layout>
        <div className="flex h-80 items-center justify-center">
          <a
            href="/auth"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow"
          >
            Sign in to chat
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ChatBox user={session.user} />
    </Layout>
  );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['nav', 'common'])),
    },
    revalidate: 60,
  };
};