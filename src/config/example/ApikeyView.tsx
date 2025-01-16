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
  const [maxRequests, setMaxRequests] = useState<string>("");
  const [remainingRequests, setRemainingRequests] = useState<string>("");
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

  const handleSubmit = async () => {
    if (!apiKey || !limit || !expiryDate || !maxRequests) {
      toast({
        title: "Error",
        description: "Semua input wajib diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formattedExpiryDate = new Date(expiryDate).toISOString().slice(0, -1) + "+00:00";

    const newRequest = {
      apiKey,
      expiryDate: formattedExpiryDate,
      limit: Number(limit),
      maxRequests: Number(maxRequests),
      remainingRequests: maxRequests,
    };

    try {
      const response = await fetch(`/api/github/updateApiKeys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "API Key berhasil ditambahkan.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setRequests((prev) => [...prev, newRequest]);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Gagal menambahkan API Key.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghubungi server.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

    try {
      const response = await fetch(`/api/github/deleteApiKey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: selectedApiKey, reason: deleteReason }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "API Key berhasil dihapus.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setRequests((prev) => prev.filter((req) => req.apiKey !== selectedApiKey));
        setSelectedApiKey(null);
        setDeleteReason("");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus API Key.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghubungi server.",
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
