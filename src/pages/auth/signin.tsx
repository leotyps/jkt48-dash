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
import { getServerSession } from '@/utils/auth/server'; // Import getServerSession

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
      // Redirect or set session as needed
      window.location.href = '/user/home'; // Contoh redirect setelah login sukses
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

// Menambahkan tipe untuk getServerSidePropsContext
export const getServerSideProps = async ({ req }: GetServerSidePropsContext) => {
  const loggedin = getServerSession(req).success; // Pastikan getServerSession diimpor dengan benar

  if (loggedin) {
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
