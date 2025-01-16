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

// Fetch chat_id menggunakan username Telegram
const getChatId = async (telegramUsername: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`);
    const data = await response.json();

    // Mencari chat_id berdasarkan username
    const userChat = data.result.find(
      (update) => update.message?.from?.username === telegramUsername
    );

    if (userChat) {
      return userChat.message.chat.id; // Mengambil chat_id
    } else {
      throw new Error("Username Telegram tidak ditemukan!");
    }
  } catch (error) {
    console.error("Error getting chat_id:", error);
    throw new Error("Terjadi kesalahan saat mengambil chat_id.");
  }
};

// Mengirimkan pesan ke Telegram dengan tombol inline
const sendTelegramNotification = async (chatId: string, message: string, inlineKeyboard: any) => {
  try {
    await fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        reply_markup: JSON.stringify({
          inline_keyboard: inlineKeyboard,
        }),
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
};

export default function HomeView() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [maxRequests, setMaxRequests] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [telegramUsername, setTelegramUsername] = useState<string>("");
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

    try {
      // Ambil chat_id pengguna
      const chatId = await getChatId(telegramUsername);

      const confirmationMessage = `Halo, ${telegramUsername}, 
        Anda telah meminta API Key baru dengan detail berikut:
        - API Key: ${apiKey}
        - Limit: ${limit}
        - Masa Aktif: ${expiryDate}
        
        Harap klik tombol di bawah untuk mengonfirmasi permintaan Anda.`;

      const inlineKeyboard = [
        [
          {
            text: "Konfirmasi Permintaan API Key",
            callback_data: `confirm-${apiKey}`, // Tindakan ketika tombol diklik
          },
        ],
      ];

      // Kirim konfirmasi ke pengguna melalui Telegram
      await sendTelegramNotification(chatId, confirmationMessage, inlineKeyboard);

      toast({
        title: "Info",
        description:
          "Permintaan API Key telah dikirim. Harap konfirmasi di Telegram Anda.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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

    try {
      // Ambil chat_id pengguna
      const chatId = await getChatId(telegramUsername);

      const deleteMessage = `Halo, ${telegramUsername}, 
        Anda telah meminta penghapusan API Key berikut:
        - API Key: ${selectedApiKey}
        - Alasan: ${deleteReason}
        
        Harap klik tombol di bawah untuk mengonfirmasi penghapusan.`;

      const inlineKeyboard = [
        [
          {
            text: "Konfirmasi Penghapusan API Key",
            callback_data: `delete-${selectedApiKey}`, // Tindakan ketika tombol diklik
          },
        ],
      ];

      // Kirim notifikasi penghapusan ke pengguna melalui Telegram
      await sendTelegramNotification(chatId, deleteMessage, inlineKeyboard);

      toast({
        title: "Info",
        description:
          "Permintaan penghapusan API Key telah dikirim. Harap konfirmasi di Telegram Anda.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
          type="number"
          placeholder="Masukkan Max Requests"
          value={maxRequests}
          onChange={(e) => setMaxRequests(e.target.value)}
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
        <Heading size="md">Riwayat Pengajuan</Heading>
        <Table variant="simple" mt={4}>
          <Thead>
            <Tr>
              <Th>API Key</Th>
              <Th>Limit</Th>
              <Th>Masa Aktif</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request, index) => (
              <Tr key={index}>
                <Td>{request.apiKey}</Td>
                <Td>{request.limit}</Td>
                <Td>{request.expiryDate}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
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
          <Button colorScheme="red" onClick={handleDeleteApiKey}>
            Hapus API Key
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
