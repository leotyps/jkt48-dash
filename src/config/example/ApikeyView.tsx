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
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C"; // Ganti dengan URL webhook Anda

  // Check API Key validity
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

  // Load notes from local storage
  useEffect(() => {
    const savedRequests = localStorage.getItem("apikey-requests");
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  }, []);

  // Update status to "Aktif" after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedRequests = requests.map((request) => {
        const createdTime = new Date(request.createdAt).getTime();
        const now = Date.now();

        if (
          request.status === "Menunggu Aktivasi" &&
          now - createdTime >= 5 * 60 * 1000
        ) {
          return { ...request, status: "Aktif" };
        }
        return request;
      });

      setRequests(updatedRequests);
      localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));
    }, 1000);

    return () => clearInterval(interval);
  }, [requests]);

  // Submit function
  const handleSubmit = async () => {
    if (!apiKey || !limit || !expiryDate) {
      toast({
        title: "Error",
        description: "Semua input wajib diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newRequest = {
      apiKey,
      limit: Number(limit),
      expiryDate,
      status: "Menunggu Aktivasi",
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          limit: Number(limit),
          expiryDate,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description:
            "Permintaan API Key berhasil diajukan. Tunggu 5 menit untuk aktivasi.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Gagal mengirim email.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim email. Silakan coba lagi.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setApiKey("");
    setLimit("");
    setExpiryDate("");
  };

  // Handle delete API Key
  const handleDeleteApiKey = async () => {
    if (!selectedApiKey || !deleteReason) {
      toast({
        title: "Error",
        description: "Pilih API Key dan masukkan alasan penghapusan!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedRequests = requests.filter(
      (request) => request.apiKey !== selectedApiKey
    );
    setRequests(updatedRequests);
    localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));

    // Send webhook notification
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `API Key "${selectedApiKey}" telah dihapus.\nAlasan: ${deleteReason}`,
        }),
      });

      toast({
        title: "Success",
        description: "API Key berhasil dihapus dan pemberitahuan dikirim.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim pemberitahuan ke webhook.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setSelectedApiKey(null);
    setDeleteReason("");
  };

  // Render rejection page if not authorized
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
          onClick={() => window.location.href = "https://wa.me/6285701479245"}
        >
          Upgrade Sekarang
        </Button>
      </Flex>
    );
  }

  // Wait until API Key is validated
  if (isAuthorized === null) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Text>Memeriksa validitas API Key Anda...</Text>
      </Flex>
    );
  }

  // Authorized content
  return (
    <Flex direction="column" gap={5}>
      <Heading>Permintaan API Key</Heading>

      {/* Form Input */}
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
        <Button colorScheme="blue" onClick={handleSubmit}>
          Ajukan API Key
        </Button>
      </VStack>

      {/* Table to Display Requests */}
      <Box>
        <Heading size="md">Riwayat Pengajuan</Heading>
        <Table variant="simple" mt={4}>
          <Thead>
            <Tr>
              <Th>API Key</Th>
              <Th>Limit</Th>
              <Th>Masa Aktif</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request, index) => (
              <Tr key={index}>
                <Td>{request.apiKey}</Td>
                <Td>{request.limit}</Td>
                <Td>{request.expiryDate}</Td>
                <Td>{request.status}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Form to Delete API Key */}
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
