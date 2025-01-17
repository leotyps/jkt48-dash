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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function HomeView() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [maxRequests, setMaxRequests] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

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

  useEffect(() => {
    const savedRequests = localStorage.getItem("apikey-requests");
    if (savedRequests) setRequests(JSON.parse(savedRequests));
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

    const randomFee = Math.floor(Math.random() * 250) + 1; // Generate random fee
    const amount = 1000; // Base price

    try {
      // Create payment request
      setIsLoadingPayment(true);
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${amount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&feeType=rupiah&fee=${randomFee}&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.dynamicQRIS) {
        setPaymentDetails({
          qrImageUrl: data.qrImageUrl,
          totalAmount: parseInt(data.amount) + parseInt(data.fee),
          fee: data.fee,
          expiryDate,
          apiKey,
          limit,
          maxRequests,
        });
        setPaymentPopup(true);
      } else {
        toast({
          title: "Error",
          description: "Gagal membuat pembayaran QRIS.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghubungi server pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const confirmPayment = async () => {
    try {
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/cekstatus?merchant=OK1453563&keyorkut=584312217038625421453563OKCT6AF928C85E124621785168CD18A9B693&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.status === "success") {
        const latestTransaction = data.data.sort(
  (a: { date: string }, b: { date: string }) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
)[0];

        if (latestTransaction.amount === "1") {
          toast({
            title: "Success",
            description: "Pembayaran berhasil. Webhook terkirim.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          setPaymentPopup(false);

          // Send webhook
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: `API Key baru telah dibuat: ${paymentDetails.apiKey}`,
            }),
          });
        } else {
          toast({
            title: "Error",
            description: "Pembayaran belum terverifikasi.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengecek status pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
          {isLoadingPayment ? <Spinner /> : "Ajukan API Key"}
        </Button>
      </VStack>

      <Modal isOpen={paymentPopup} onClose={() => setPaymentPopup(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Konfirmasi Pembayaran QRIS</ModalHeader>
          <ModalBody>
            <Text>API Key: {paymentDetails?.apiKey}</Text>
            <Text>Harga: 1000</Text>
            <Text>Fee: {paymentDetails?.fee}</Text>
            <Text>Total: {paymentDetails?.totalAmount}</Text>
            <Image src={paymentDetails?.qrImageUrl} alt="QRIS" />
            <Text>
              Harap scan QRIS dan tekan &rdquo;Konfirmasi&rdquo; untuk mengecek status
              pembayaran.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={confirmPayment}>
              Konfirmasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
