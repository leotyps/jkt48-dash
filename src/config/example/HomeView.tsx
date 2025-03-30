import {
  Center,
  Circle,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useToast,
  Box,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { config } from '@/config/common';
import { StyledChart } from '@/components/chart/StyledChart';
import { dashboard } from '@/config/translations/dashboard';
import Link from 'next/link';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { IoOpen, IoPricetag } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { MdVoiceChat, MdVisibility, MdVisibilityOff, MdAccountBalanceWallet } from 'react-icons/md';
import { GuildSelect } from '@/pages/user/home';
import { IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack } from 'react-icons/io5';
import { useSelfUser } from '@/api/hooks'; 

export default function HomeView() {
  const user = useSelfUser();
  const t = dashboard.useTranslations();
  
type User = {
  id: string;
  username: string;
  // tambahkan properti lain yang Anda perlukan dari user
};
  
  
function initializeApiKeyAndSaveUserData(user: User) {
  if (typeof window !== 'undefined') {
    const existingKey = localStorage.getItem('jkt48-api-key');

    // Buat parameter query dari data user
    const userData = new URLSearchParams({
      id: user.id,
      username: user.username,
      balance: '0', // Misalnya saldo awal adalah 0
    });

    if (!existingKey) {
      fetch(`/api/auth/get-api-key?${userData.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) {
            localStorage.setItem('jkt48-api-key', data.apiKey);
            console.log('API Key saved to localStorage:', data.apiKey);
          }
        })
        .catch((err) => console.error('Failed to fetch API key:', err));
    } else {
      console.log('API Key already exists in localStorage:', existingKey);
    }
  }
}

useEffect(() => {
  // Pastikan user sudah tersedia sebelum memanggil fungsi
  if (user) {
    initializeApiKeyAndSaveUserData(user);
  }
}, [user]);

  return (
    <Flex direction="column" gap={5}>
      {/* Invite Section */}
      <Flex direction="row" alignItems="center" rounded="2xl" bg="Brand" gap={4} p={5}>
        <Circle
          color="white"
          bgGradient="linear(to right bottom, transparent, blackAlpha.600)"
          p={4}
          shadow="2xl"
          display={{ base: 'none', md: 'block' }}
        >
          <Icon as={FaRobot} w="60px" h="60px" />
        </Circle>

        <Flex direction="column" align="start" gap={1}>
          <Heading color="white" fontSize="2xl" fontWeight="bold">
            {t.invite.title}
          </Heading>
          <Text color="whiteAlpha.800">{t.invite.description}</Text>
          <Button
            mt={3}
            as={Link}
            href={config.inviteUrl}
            color="white"
            bg="whiteAlpha.200"
            _hover={{
              bg: 'whiteAlpha.300',
            }}
            _active={{
              bg: 'whiteAlpha.400',
            }}
            leftIcon={<IoOpen />}
          >
            {t.invite.bn}
          </Button>
        </Flex>
      </Flex>

      {/* JKT48Connect Section */}
     <Grid
  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
  gap={4}
>
       <Flex direction="column" gap={3}>
          <VoiceChannelItem />
        </Flex>
      </Grid>

      {/* Servers Section */}
      <Flex direction="column" gap={1} mt={3}>
        <Heading size="md">{t.servers.title}</Heading>
        <Text color="TextSecondary">{t.servers.description}</Text>
      </Flex>
      <GuildSelect />

      {/* Commands Section */}
      <Flex direction="column" gap={1}>
        <Heading size="md">{t.command.title}</Heading>
        <Text color="TextSecondary">{t.command.description}</Text>
        <HStack mt={3}>
          <Button leftIcon={<IoPricetag />} variant="action">
            {t.pricing}
          </Button>
          <Button px={6} rounded="xl" variant="secondary">
            {t.learn_more}
          </Button>
        </HStack>
      </Flex>

      {/* Chart Section */}
      <TestChart />

      {/* Radio Music Section */}
<Flex direction="column" gap={3} mt={5}>
  <Heading size="md">Radio Music Section</Heading>
  <Card rounded="3xl" variant="primary">
    <CardBody as={Center} p={4} flexDirection="column" gap={3}>
      <MusicPlayer />
    </CardBody>
  </Card>
</Flex>
    </Flex>
  );
}


function TestChart() {
  const getFormattedDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  const [seriesData, setSeriesData] = useState([
    {
      name: "Requests",
      data: [0], // Data awal untuk menit 1
    },
  ]);
  const [minute, setMinute] = useState(1); // Mulai dari menit 1
  const [today, setToday] = useState<string>(getFormattedDate());

  useEffect(() => {
    // Set interval untuk menambah data secara acak setiap menit
    const intervalId = setInterval(() => {
      addRandomData();
    }, 60000); // Interval setiap 1 menit (60000 ms)

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Cek perubahan hari setiap 1 menit
    const intervalId = setInterval(() => {
      const currentDay = getFormattedDate();
      if (currentDay !== today) {
        resetDailyData();
        setToday(currentDay);
      }
    }, 60000); // Setiap 1 menit cek jika hari berubah

    return () => clearInterval(intervalId);
  }, [today]);

  const addRandomData = () => {
    const randomRequests = Math.floor(Math.random() * 10); // Angka acak antara 0 dan 9

    setSeriesData((prevData) => {
      const updatedData = [...prevData[0].data];
      updatedData.push(randomRequests); // Tambahkan data acak ke menit berikutnya

      return [{ name: "Requests", data: updatedData }];
    });

    // Tambahkan 1 menit setiap kali data ditambahkan
    setMinute((prevMinute) => prevMinute + 1);
  };

  const resetDailyData = () => {
    setSeriesData((prevData) => {
      const updatedData = [...prevData[0].data];
      updatedData.push(0); // Reset pemakaian ke 0 untuk hari baru

      return [{ name: "Requests", data: updatedData }];
    });
  };

  return (
    <StyledChart
      options={{
        colors: ["#4318FF"],
        chart: {
          type: "line",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 1000,
          },
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        xaxis: {
          categories: Array.from({ length: minute }, (_, i) => `Menit ${i + 1}`), // Kategori berdasarkan menit
        },
        yaxis: {
          labels: {
            formatter: (value) => `${value} requests`,
          },
        },
        grid: {
          borderColor: "#EDEDED",
          strokeDashArray: 4,
        },
        legend: {
          show: false,
        },
      }}
      series={seriesData}
      height="300"
      type="line"
    />
  );
}

function MusicPlayer() {
  const videoUrls = [
    { url: 'https://8030.us.kg/file/tu1QxK8pfvGN.mp4', title: 'Dj Anugrah Terindah' },
    { url: 'https://8030.us.kg/file/SSN3QnR0C5sU.mp4', title: 'Dj Terlalu Cinta' },
    { url: 'https://8030.us.kg/file/wU0N09SMt41S.mp4', title: 'Gedene Cintaku Luarr Biasa (Tresno Tekan Mati)' },
    { url: 'https://8030.us.kg/file/BBjoKygdO5Wi.mp4', title: 'Dj Aku Gak Mau Selain Kamu' }   
  ]; // Daftar file video .mp4 dengan judul
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Indeks lagu saat ini
  const [isPlaying, setIsPlaying] = useState(false); // Status pemutaran
  const videoRef = useRef<HTMLVideoElement>(null); // Referensi ke elemen video

  const currentTrack = videoUrls[currentTrackIndex];

  const playVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) videoRef.current.play();
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % videoUrls.length);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex - 1 < 0 ? videoUrls.length - 1 : prevIndex - 1
    );
    setIsPlaying(true);
  };

  return (
    <Flex direction="column" align="center" gap={3}>
      <Text fontWeight="medium">Now Playing:</Text>
      <Text fontSize="lg" fontWeight="bold" textAlign="center">
        {currentTrack.title}
      </Text>
      <Box w="100%" maxW="600px" rounded="lg" overflow="hidden" shadow="md">
        <video
          ref={videoRef}
          width="100%"
          height="300"
          src={currentTrack.url}
          controls={false} // Tidak menampilkan kontrol bawaan
          onEnded={nextTrack} // Lanjut ke lagu berikutnya setelah video selesai
        ></video>
      </Box>
            {/* Audio untuk pemutaran latar belakang */}
      <audio ref={videoRef} src={currentTrack.url} preload="auto" onEnded={nextTrack}></audio>

      <HStack spacing={4} mt={4}>
        <IconButton
          icon={<IoPlaySkipBack />}
          aria-label="Previous Track"
          onClick={previousTrack}
          isDisabled={videoUrls.length <= 1}
        />
        {isPlaying ? (
          <IconButton
            icon={<IoPause />}
            aria-label="Pause Video"
            onClick={pauseVideo}
          />
        ) : (
          <IconButton
            icon={<IoPlay />}
            aria-label="Play Video"
            onClick={playVideo}
          />
        )}
        <IconButton
          icon={<IoPlaySkipForward />}
          aria-label="Next Track"
          onClick={nextTrack}
          isDisabled={videoUrls.length <= 1}
        />
      </HStack>
    </Flex>
  );
}

function VoiceChannelItem() {
  const user = useSelfUser(); // Mendapatkan data user
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null); // State untuk saldo
  const toast = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('jkt48-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      checkApiKey(storedApiKey);
    }
    if (user?.id) {
      fetchUserBalance(user.id); // Ambil saldo saat komponen dimuat jika user.id tersedia
    }
  }, [user?.id]); // Gunakan efek ini ketika user.id berubah

  const checkApiKey = async (key: string) => {
    if (!key) {
      toast({
        title: 'Error',
        description: 'API Key tidak boleh kosong!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`https://api.jkt48connect.my.id/api/check-apikey/${key}`);
      const data = await response.json();

      if (data.success) {
        setExpiryDate(data.expiry_date);
        setRemainingRequests(data.remaining_requests);
        setApiStatus('API Key valid');
      } else {
        setApiStatus(data.message);
      }
    } catch (error) {
      setApiStatus('Terjadi kesalahan saat memeriksa API Key.');
    }
  };

  const fetchUserBalance = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/get-user-data?id=${userId}`);
      const data = await response.json();

      if (data.user.balance !== undefined) {
        setBalance(data.user.balance); // Simpan saldo ke state
      } else {
        console.error('Gagal mendapatkan saldo:', data.message);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengambil saldo:', error);
    }
  };

  return (
    <Flex 
      direction="column" 
      gap={4} 
      mt={3}
      w="100%" // Ensure full width on all screen sizes
    >
      {/* Status API Key */}
      <Card 
        rounded="2xl" 
        variant="primary" 
        p={{ base: 4, md: 6 }}
        w="100%" // Ensure full width
      >
        <CardHeader as={HStack}>
          <Icon as={MdVoiceChat} color="Brand" fontSize={{ base: 'xl', md: '2xl' }} />
          <Text fontSize={{ base: 'md', md: 'lg' }}>Status API Key</Text>
        </CardHeader>
        <CardBody>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color={apiStatus?.includes('valid') ? 'green.500' : 'red.500'}
            fontWeight="medium"
          >
            {apiStatus || 'Memeriksa API Key...'}
          </Text>
        </CardBody>
      </Card>

      {/* API Key */}
      <Card 
        rounded="2xl" 
        variant="primary" 
        p={{ base: 4, md: 6 }}
        w="100%" // Ensure full width
      >
        <CardHeader>
          <HStack justify="space-between" align="center" w="100%">
            <Text 
              fontSize={{ base: 'md', md: 'lg' }} 
              fontWeight="bold"
              isTruncated // Ensures text doesn't overflow
              maxW={{ base: "200px", md: "none" }} // Allow full width on desktop
            >
              {isApiKeyVisible ? apiKey : '•'.repeat(apiKey.length)}
            </Text>
            <Button
              size="sm"
              onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
              variant="ghost"
              p={0}
              flexShrink={0} // Prevent button from shrinking
            >
              {isApiKeyVisible ? <MdVisibilityOff /> : <MdVisibility />}
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          {apiKey ? (
            <Text fontSize={{ base: 'sm', md: 'md' }} color="TextSecondary">
              API Key
            </Text>
          ) : (
            <Text color="TextSecondary">API Key belum tersedia. Silakan tambahkan API Key di profil.</Text>
          )}
        </CardBody>
      </Card>

      {/* Saldo User */}
      <Card 
        rounded="2xl" 
        variant="primary" 
        p={{ base: 4, md: 6 }}
        w="100%" // Ensure full width
      >
        <CardHeader as={HStack}>
          <Icon as={MdAccountBalanceWallet} color="Brand" fontSize={{ base: 'xl', md: '2xl' }} />
          <Text fontSize={{ base: 'md', md: 'lg' }}>Saldo</Text>
        </CardHeader>
        <CardBody>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
            {balance !== null ? `Rp ${balance.toLocaleString()}` : 'Memuat...'}
          </Text>
          <Text fontSize="sm" color="TextSecondary">
            Saldo akun Anda yang tersisa
          </Text>
        </CardBody>
      </Card>
    </Flex>
  );
}
