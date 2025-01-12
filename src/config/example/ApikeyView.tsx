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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function HomeView() {
  const [apiKey, setApiKey] = useState<string>("");
  const [limit, setLimit] = useState<string>(""); // String untuk placeholder dinamis
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const toast = useToast();

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

        if (request.status === "Menunggu Aktivasi" && now - createdTime >= 5 * 60 * 1000) {
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
          description: "Permintaan API Key berhasil diajukan. Tunggu 5 menit untuk aktivasi.",
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

  return (
    <Flex direction="column" gap={5}>
      <Heading>Permintaan API Key</Heading>

      {/* Form Input */}
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Masukkan API Key (contoh: 12345-ABCDE)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Input
          type="number"
          placeholder={limit ? "" : "Masukkan Limit API Key (contoh: 1000)"}
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
                <Td>
                  <Text
                    color={
                      request.status === "Menunggu Aktivasi"
                        ? "yellow.500"
                        : "green.500"
                    }
                    fontWeight="bold"
                  >
                    {request.status}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}
