import { useState, useEffect } from 'react';
import { Flex, Grid, Text, VStack, Box } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Image,
  useColorMode,
  Input,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { useSelfUser } from '@/api/hooks';
import AppLayout from '@/components/layout/app';
import { NextPageWithLayout } from '@/pages/_app';

const ProfilePage: NextPageWithLayout = () => {
  const user = useSelfUser();
  const { colorMode, setColorMode } = useColorMode();
  const toast = useToast();

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberStatus, setPhoneNumberStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Fungsi untuk meminta OTP dari server
  const requestOtp = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Nomor WhatsApp tidak boleh kosong!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/otp?phone=${phoneNumber}`, { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setGeneratedOtp(data.otp);
        setIsOtpModalOpen(true);
        toast({
          title: 'OTP Dikirim',
          description: 'Kode OTP telah dikirim ke nomor WhatsApp Anda.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Gagal mengirim OTP!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat meminta OTP.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fungsi untuk memverifikasi OTP sebelum menyimpan nomor
  const verifyOtpAndSaveNumber = async () => {
    if (otpCode !== generatedOtp) {
      toast({
        title: 'Error',
        description: 'Kode OTP yang dimasukkan salah!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await fetch(`/api/auth/edit-phone-number?id=${user.id}&phoneNumber=${phoneNumber}`, {
        method: 'GET',
      });

      if (response.ok) {
        setPhoneNumberStatus('Nomor WhatsApp berhasil disimpan');
        setIsOtpModalOpen(false);
        setOtpCode('');
        setGeneratedOtp('');

        toast({
          title: 'Success',
          description: 'Nomor WhatsApp berhasil disimpan dan diperbarui di server!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Gagal memperbarui nomor WhatsApp di server!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving phone number:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan nomor WhatsApp.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    fetch(`https://api.jkt48connect.my.id/api/check-apikey/${localStorage.getItem('jkt48-api-key')}`)
      .then((res) => res.json())
      .then((data) => {
        setIsPremium(data.premium || false);
      })
      .catch(() => setIsPremium(false))
      .finally(() => setIsChecking(false));
  }, []);

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 800px) auto' }} gap={{ base: 3, lg: 6 }}>
      <Flex direction="column">
        <Image
          alt="banner"
          src="https://8030.us.kg/file/3gjp59rB7bs8.jpg"
          sx={{ aspectRatio: '1100 / 440' }}
          objectFit="cover"
          rounded="2xl"
        />
        <VStack mt="-50px" ml="40px" align="start">
          <Avatar src={user.avatar} name={user.username} w="100px" h="100px" />
          <Text fontWeight="600" fontSize="2xl" display="flex" alignItems="center">
            {user.username}
            {isChecking ? (
              <Spinner ml={2} size="sm" />
            ) : (
              <Box as="span" ml={2}>
                <RiVerifiedBadgeFill
                  size={20}
                  color={isPremium ? '#4299E1' : '#A0AEC0'}
                  title={isPremium ? 'Verified Premium' : 'Not Premium'}
                />
              </Box>
            )}
          </Text>
        </VStack>
      </Flex>
      <Card w="full" rounded="3xl" variant="primary">
        <CardHeader fontSize="2xl" fontWeight="600">Settings</CardHeader>
        <CardBody as={Flex} direction="column" gap={6} mt={3}>
          <FormControl>
            <Box mb={2}>
              <FormLabel fontSize="md" fontWeight="medium">Nomor WhatsApp</FormLabel>
              <Text color="TextSecondary">Simpan nomor WhatsAppmu disini</Text>
            </Box>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Masukkan Nomor WhatsApp"
              size="lg"
            />
            {phoneNumberStatus && <Text mt={2}>{phoneNumberStatus}</Text>}
          </FormControl>
          <Button colorScheme="teal" onClick={requestOtp}>Simpan Nomor WhatsApp</Button>
        </CardBody>
      </Card>

      {/* Modal OTP */}
      <Modal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verifikasi OTP</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Masukkan Kode OTP</FormLabel>
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Masukkan OTP"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={verifyOtpAndSaveNumber} isLoading={isVerifyingOtp}>
              Verifikasi OTP
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
