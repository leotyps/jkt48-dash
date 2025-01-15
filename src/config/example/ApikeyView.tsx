import { useState, useEffect } from "react";
import { Button, Flex, Heading, Input, Text, VStack, useToast, Table, Thead, Tr, Th, Tbody, Td, Box, Select, Textarea } from "@chakra-ui/react";
import { Pool } from "pg";
import { useRouter } from "next/router";

export default function HomeView() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const toast = useToast();
  const router = useRouter();

  const pool = new Pool({
    connectionString: 'postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
  });

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

  // Handle API key submission and saving to the database
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
      status: "Menunggu Aktivasi", // Initial status is "Menunggu Aktivasi"
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));

    try {
      // Save to CockroachDB
      const client = await pool.connect();

      // Insert API Key into the database
      await client.query(
        `INSERT INTO api_keys (api_key, expiry_date, remaining_requests, max_requests, last_access_date, seller) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          apiKey,
          expiryDate,
          limit, // Assuming limit is used as "remaining_requests"
          limit, // Assuming limit is used as "max_requests"
          new Date().toISOString(), // Set the current date as last access date
          false, // Assuming seller is false for now, modify if needed
        ]
      );

      // Mark request status as "Aktif" if the insert is successful
      const updatedRequestsWithStatus = updatedRequests.map((request) =>
        request.apiKey === apiKey ? { ...request, status: "Aktif" } : request
      );
      setRequests(updatedRequestsWithStatus);
      localStorage.setItem("apikey-requests", JSON.stringify(updatedRequestsWithStatus));

      toast({
        title: "Success",
        description:
          "Permintaan API Key berhasil diajukan dan disimpan. Status diubah menjadi 'Aktif'.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving API Key:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan API Key ke database.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setApiKey("");
      setLimit("");
      setExpiryDate("");
    }
  };

  // Handle deletion logic
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

    // Send webhook notification with embed
    try {
      const webhookUrl =
        "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C"; // Replace with your webhook URL
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [
            {
              title: "API Key Dihapus",
              description: `API Key "${selectedApiKey}" telah dihapus.`,
              fields: [
                {
                  name: "Alasan Penghapusan",
                  value: deleteReason,
                  inline: true,
                },
              ],
              color: 0xff0000, // Red color
              timestamp: new Date().toISOString(),
            },
          ],
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
