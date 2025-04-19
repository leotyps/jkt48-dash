import { GetServerSidePropsContext } from 'next';
import { 
  Button, 
  Flex, 
  Heading, Divider,
  Icon, Text, 
  Input, 
  InputGroup, 
  InputLeftElement,
  FormControl,
  FormLabel,
  Box,
  VStack,
  HStack,
  Container,
  useColorModeValue
} from '@chakra-ui/react';
import { BsDiscord, BsGoogle, BsEnvelope, BsLock } from 'react-icons/bs';
import { FiUser } from 'react-icons/fi';
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '@/config/firebaseConfig';
import { getServerSession } from '@/utils/auth/server';
import Link from 'next/link';

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      const userSession = {
        access_token: idToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email',
      };
      
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSession),
      });
      
      if (response.ok) {
        await createApiKey(user.uid);
        router.push('/user/home');
      } else {
        setError('Failed to save session');
      }
    } catch (error: any) {
      console.error('Error logging in with email/password:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      const userSession = {
        access_token: idToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email',
      };
      
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSession),
      });
      
      if (response.ok) {
        await createApiKey(user.uid);
        router.push('/user/home');
      } else {
        setError('Failed to save session');
      }
    } catch (error: any) {
      console.error('Error logging in with Google:', error);
      setError(error.message || 'Google login failed');
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
    <Container maxW="md" py={10}>
      <Box
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="center" w="full">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" fontWeight="600">
              {t.login}
            </Heading>
            <Text color="TextSecondary" fontSize="md">
              {t['login description']}
            </Text>
          </VStack>

          {error && (
            <Text color="red.500" fontSize="sm" w="full" textAlign="center">
              {error}
            </Text>
          )}

          <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
            <VStack spacing={4} w="full">
              <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={BsEnvelope} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormControl>

              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={BsLock} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                variant="solid"
                colorScheme="blue"
                size="md"
                width="full"
                isLoading={loading}
                leftIcon={<Icon as={FiUser} />}
              >
                Sign In with Email
              </Button>
            </VStack>
          </form>

          <HStack w="full">
            <Divider />
            <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
              OR CONTINUE WITH
            </Text>
            <Divider />
          </HStack>

          <VStack spacing={3} w="full">
            <Button
              leftIcon={<Icon as={BsGoogle} fontSize="xl" />}
              variant="outline"
              size="md"
              width="full"
              onClick={handleGoogleLogin}
              isLoading={loading}
            >
              Sign in with Google
            </Button>

            <Button
              leftIcon={<Icon as={BsDiscord} fontSize="xl" />}
              colorScheme="purple"
              variant="outline"
              size="md"
              width="full"
              as="a"
              href={`/api/auth/login?locale=${locale}`}
              isDisabled={loading}
            >
              Sign in with Discord
            </Button>
          </VStack>

          <HStack justify="center" w="full" pt={2}>
            <Text fontSize="sm">Don&apos;t have an account?</Text>
            <Link href="/register" passHref>
              <Text as="a" color="blue.500" fontWeight="semibold" fontSize="sm">
                Register now
              </Text>
            </Link>
          </HStack>

          <Text fontSize="xs" color="gray.500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </VStack>
      </Box>
    </Container>
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
