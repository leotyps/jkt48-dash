import { GetServerSidePropsContext } from 'next'; 
import { Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { BsDiscord } from 'react-icons/bs';
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth as firebaseAuth } from '@/config/firebaseConfig';
import { getServerSession } from '@/utils/auth/server';

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        redirect_uri: `https://dash.jkt48connect.my.id/api/auth/callback`, // Callback URL
      });

      await signInWithRedirect(firebaseAuth, provider);

      const result = await getRedirectResult(firebaseAuth);
      if (result) {
        const user = result.user;

        // Dapatkan token ID untuk disimpan ke sesi
        const idToken = await user.getIdToken();
        const userSession = {
          access_token: idToken,
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: user.refreshToken,
          scope: 'email',
        };

        // Kirim data ke API
        const response = await fetch('/api/auth/setSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userSession),
        });

        if (response.ok) {
          window.location.href = '/user/home';
        } else {
          console.error('Error saving session');
        }
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
    } finally {
      setLoading(false);
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
      <Button
        mt={3}
        leftIcon={<Icon as={BsDiscord} fontSize="2xl" />}
        variant="action"
        size="lg"
        width="350px"
        maxW="full"
        onClick={handleGoogleLogin}
        isLoading={loading}
      >
        Login with Google
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
        permanent: true,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
