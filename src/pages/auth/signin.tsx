import { GetServerSidePropsContext } from 'next'; // Import GetServerSidePropsContext
import { Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { BsDiscord } from 'react-icons/bs';
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '@/config/firebaseConfig';
import { setServerSession } from '@/utils/auth/server'; // Import setServerSession

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const user = result.user;
      console.log('Logged in user:', user);

      // Ambil token ID menggunakan getIdToken()
      const idToken = await user.getIdToken();

      // Menyimpan token atau informasi sesi dalam cookie
      const userSession = {
        access_token: idToken, // Menggunakan token yang didapat dari getIdToken()
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email', // atau scope lain yang diperlukan
      };

      // Setel sesi di server
      setServerSession(userSession, { req: window.document, res: window.document }); // Sesuaikan req dan res jika perlu

      // Redirect ke halaman dashboard setelah login berhasil
      window.location.href = '/user/home';
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
        as="a"
        href={`/api/auth/login?locale=${locale}`}
      >
        {t.login_bn}
      </Button>
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
  const session = getServerSession(req);

  // Periksa apakah sesi sudah valid
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
