import { GetServerSidePropsContext } from 'next';
import { Button, Flex, Heading, Icon, Text, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { BsEnvelope } from 'react-icons/bs';
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '@/config/firebaseConfig';
import { getServerSession } from '@/utils/auth/server';

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Flag to toggle between sign-up and login

  const handleAuth = async () => {
    setLoading(true);
    try {
      let userCredential;
      
      if (isSignUp) {
        // Handle sign-up
        userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        // Handle login
        userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      }

      const user = userCredential.user;
      const idToken = await user.getIdToken();
      const userSession = {
        access_token: idToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email',
      };

      // Send token to the server to save the session
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSession),
      });

      if (response.ok) {
        // Create API key after successful sign-up or login
        await createApiKey(user.uid);

        // Redirect to the home page after successful login
        router.push('/user/home');
      } else {
        console.error('Failed to save session');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    } finally {
      setLoading(false);
    }
  };

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

      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </FormControl>

      <FormControl id="password" isRequired mt={4}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </FormControl>

      <Button
        mt={6}
        leftIcon={<Icon as={BsEnvelope} fontSize="2xl" />}
        variant="action"
        size="lg"
        width="350px"
        maxW="full"
        onClick={handleAuth}
        isLoading={loading}
        loadingText={isSignUp ? 'Signing up...' : 'Logging in...'}
      >
        {isSignUp ? t.signup_bn : t.login_bn}
      </Button>

      <Button
        mt={3}
        variant="link"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? t['already have an account?'] : t['need an account?']}
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
