import { GetServerSidePropsContext } from 'next';
import { Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { BsDiscord } from 'react-icons/bs';
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth } from '@/config/firebaseConfig';
import { getServerSession } from '@/utils/auth/server';

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // Login dengan popup
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      // Dapatkan token ID
      const idToken = await user.getIdToken();
      const userSession = {
        access_token: idToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email',
      };

      // Kirim token ke server untuk disimpan sebagai sesi
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSession),
      });

      if (response.ok) {
        // Buat API key untuk pengguna melalui API
        await createApiKey(user.uid);

        // Redirect ke halaman home setelah login berhasil
        router.push('/user/home');
      } else {
        console.error('Failed to save session');
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memanggil API pembuatan API key
  const createApiKey = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/createApiKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      console.log('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  return (
    <Flex
      w="full"
      h="full"
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      gap={3}
    >
      <Heading size="xl" whiteSpace="pre-wrap" fontWeight="600">
        {t.login}
      </Heading>
      <Text color="TextSecondary" fontSize="lg">
        {t['login description']}
      </Text>
      {/* Login using Discord */}
      <Button
        mt={3}
        leftIcon={<Icon as={BsDiscord} fontSize="2xl" />}
        variant="action"
        size="lg"
        width="350px"
        maxW="full"
        as="a"
        href={`/api/auth/login?locale=${locale}`}
      >
        {t.login_bn}
      </Button>
    </Flex>
  );
};

LoginPage.getLayout = (c) => <AuthLayout>{c}</AuthLayout>;
export default LoginPage;

export const getServerSideProps = async ({ req }: GetServerSidePropsContext) => {
  const session = getServerSession(req as any);

  if (session.success) {
    return {
      redirect: {
        destination: '/user/home',
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
