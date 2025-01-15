// ./pages/login.tsx
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
import { v4 as uuidv4 } from 'uuid'; // Untuk membuat ID unik
import { Pool } from 'pg'; // Koneksi ke CockroachDB

const pool = new Pool({
  connectionString:
    'postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

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
        // Buat API key untuk pengguna
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

  // Fungsi untuk membuat API key dan menyimpannya di database
  const createApiKey = async (userId: string) => {
    const randomString = uuidv4().split('-')[0].toUpperCase();
    const apiKey = `CN-${randomString}`;
    const expiryDate = getFormattedDate(7); // Masa berlaku 7 hari
    const maxRequests = 25; // Maksimal 25 permintaan
    const seller = false; // Default bukan seller

    try {
      const client = await pool.connect();

      // Periksa apakah pengguna sudah memiliki API key
      const { rows } = await client.query(
        `SELECT * FROM api_keys WHERE user_id = $1`,
        [userId]
      );

      if (rows.length === 0) {
        // Tambahkan API key baru jika belum ada
        await client.query(
          `INSERT INTO api_keys (user_id, api_key, expiry_date, remaining_requests, max_requests, last_access_date, seller) 
           VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
          [userId, apiKey, expiryDate, maxRequests, maxRequests, seller]
        );
        console.log('API key created for user:', userId);
      } else {
        console.log('User already has an API key:', userId);
      }

      client.release();
    } catch (err) {
      console.error('Error creating API key:', err);
    }
  };

  // Fungsi untuk mendapatkan tanggal format DD/MM/YYYY/HH:mm dengan penambahan hari
  const getFormattedDate = (daysToAdd: number): string => {
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}/${hours}:${minutes}`;
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
