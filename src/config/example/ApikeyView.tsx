import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Box,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function HomeView() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [telegramUsername, setTelegramUsername] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const toast = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("jkt48-api-key");
    setApiKey(storedApiKey);

    if (storedApiKey) {
      fetch(`https://api.jkt48connect.my.id/api/check-apikey/${storedApiKey}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.seller) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        })
        .catch(() => {
          setIsAuthorized(false);
        });
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const sendTelegramNotification = async (message: string) => {
    try {
      await fetch(`https://api.telegram.org/7891069269:AAHgeHtXqT8wx7oiZxZmeHkzuiTCNEvh8QM/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "@valzyyys", // Replace with admin's Telegram username or group
          text: message,
        }),
      });
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
    }
  };

  const handleSubmit = async () => {
    if (!apiKey || !limit || !expiryDate || !telegramUsername) {
      toast({
        title: "Error",
        description: "Semua input wajib diisi, termasuk username Telegram!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const confirmationMessage = `Halo, ${telegramUsername}, 
      Anda telah meminta API Key baru dengan detail berikut:
      - API Key: ${apiKey}
      - Limit: ${limit}
      - Masa Aktif: ${expiryDate}
      
      Harap balas pesan ini dengan "konfirmasi" untuk melanjutkan.`;

    // Kirim konfirmasi ke pengguna melalui Telegram
    await sendTelegramNotification(confirmationMessage);

    toast({
      title: "Info",
      description:
        "Permintaan API Key telah dikirim. Harap konfirmasi di Telegram Anda.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleDeleteApiKey = async () => {
    if (!selectedApiKey || !deleteReason || !telegramUsername) {
      toast({
        title: "Error",
        description:
          "Pilih API Key, masukkan alasan penghapusan, dan username Telegram!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const deleteMessage = `Halo, ${telegramUsername}, 
      Anda telah meminta penghapusan API Key berikut:
      - API Key: ${selectedApiKey}
      - Alasan: ${deleteReason}
      
      Harap balas pesan ini dengan "konfirmasi hapus" untuk melanjutkan.`;

    // Kirim notifikasi penghapusan ke pengguna dan admin
    await sendTelegramNotification(deleteMessage);

    toast({
      title: "Info",
      description:
        "Permintaan penghapusan API Key telah dikirim. Harap konfirmasi di Telegram Anda.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  if (isAuthorized === false) {
    return (
      <Flex height="100vh" align="center" justify="center" direction="column">
        <Heading color="red.500">Akses Ditolak</Heading>
        <Text>
          Anda bukan pengguna <strong>seller</strong>. Silakan upgrade akun Anda
          untuk mengakses halaman ini.
        </Text>
        <Button
          colorScheme="blue"
          onClick={() =>
            (window.location.href = "https://wa.me/6285701479245")
          }
        >
          Upgrade Sekarang
        </Button>
      </Flex>
    );
  }

  if (isAuthorized === null) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Text>Memeriksa validitas API Key Anda...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={5}>
      <Heading>Permintaan API Key</Heading>
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Masukkan API Key"
          value={apiKey || ""}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Masukkan Limit API Key"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Pilih Masa Aktif API Key"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <Input
          placeholder="Masukkan Username Telegram"
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Ajukan API Key
        </Button>
      </VStack>
      <Box>
        <Heading size="md">Hapus API Key</Heading>
        <VStack spacing={4} align="stretch">
          <Select
            placeholder="Pilih API Key yang ingin dihapus"
            value={selectedApiKey || ""}
            onChange={(e) => setSelectedApiKey(e.target.value)}
          >
            {requests.map((request, index) => (
              <option key={index} value={request.apiKey}>
                {request.apiKey}
              </option>
            ))}
          </Select>
          <Textarea
            placeholder="Masukkan alasan penghapusan"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
          />
          <Input
            placeholder="Masukkan Username Telegram"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
          />
          <Button colorScheme="red" onClick={handleDeleteApiKey}>
            Hapus API Key
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
