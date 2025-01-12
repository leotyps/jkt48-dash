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
import { useState } from "react";

export default function HomeView() {
  const [apiKey, setApiKey] = useState<string>("");
  const [limit, setLimit] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const toast = useToast();

  // Load notes from local storage
  useState(() => {
    const savedRequests = localStorage.getItem("apikey-requests");
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  });

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

    // Save to localStorage
    const newRequest = {
      apiKey,
      limit,
      expiryDate,
      status: "Menunggu Aktivasi",
    };
    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));

    // Send email (Call backend API for email sending)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          limit,
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
    setLimit(0);
    setExpiryDate("");
  };

  return (
    <Flex direction="column" gap={5}>
      <Heading>Permintaan API Key</Heading>

      {/* Form Input */}
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Masukkan API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Limit API Key"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        />
        <Input
          type="date"
          placeholder="Masa Aktif API Key"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Ajukan API Key
        </Button>
      </VStack>

      {/* Table to Display Notes */}
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
    </Flex>
  );
}
