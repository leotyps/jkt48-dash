import { GetServerSidePropsContext } from 'next';
import { Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs'; // Tambahkan ikon GitHub
import { auth } from '@/config/translations/auth';
import { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/components/layout/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getServerSession } from '@/utils/auth/github'; // Ganti impor ke GitHub

const LoginPage: NextPageWithLayout = () => {
  const t = auth.useTranslations();
  const locale = useRouter().locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

      {/* Login using GitHub */}
      <Button
        mt={3}
        leftIcon={<Icon as={BsGithub} fontSize="2xl" />} // Ikon GitHub
        variant="action"
        size="lg"
        width="350px"
        maxW="full"
        as="a"
        href={`/api/auth/github?locale=${locale}`} // Arahkan ke endpoint GitHub
        isLoading={loading}
        onClick={() => setLoading(true)}
      >
        {t.login_bn} {/* Sesuaikan teks jika diperlukan */}
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
