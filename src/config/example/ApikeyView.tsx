import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
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
  const [paymentPopup, setPaymentPopup] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("jkt48-api-key");
    setApiKey(storedApiKey);

    if (storedApiKey) {
      fetch(`https://api.jkt48connect.my.id/api/check-apikey/${storedApiKey}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.seller) setIsAuthorized(true);
          else setIsAuthorized(false);
        })
        .catch(() => setIsAuthorized(false));
    } else {
      setIsAuthorized(false);
    }
  }, []);

  // Function to handle payment and show popup
  const handlePayment = async () => {
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

    const randomFee = Math.floor(Math.random() * 250) + 1;
    setIsLoading(true);

    try {
      const paymentResponse = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=1000&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE%20OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&feeType=rupiah&fee=${randomFee}&api_key=JKTCONNECT`
      );
      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok && paymentData.qrImageUrl) {
        setQrImageUrl(paymentData.qrImageUrl);
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
        description: "Gagal terhubung ke server pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to confirm payment
  const confirmPayment = async () => {
    try {
      setIsLoading(true);
      const statusResponse = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/cekstatus?merchant=OK1453563&keyorkut=584312217038625421453563OKCT6AF928C85E124621785168CD18A9B6933&api_key=JKTCONNECT`
      );
      const statusData = await statusResponse.json();

      if (
        statusResponse.ok &&
        statusData.status === "success" &&
        statusData.data.some(
          (payment: any) =>
            new Date(payment.date) > new Date(Date.now() - 5 * 60 * 1000) &&
            payment.amount === "1"
        )
      ) {
        toast({
          title: "Success",
          description: "Pembayaran berhasil dikonfirmasi!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Close popup and proceed with request submission
        setPaymentPopup(false);
        handleSubmit();
      } else {
        toast({
          title: "Error",
          description: "Pembayaran belum ditemukan atau belum valid.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengecek status pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit function
  const handleSubmit = async () => {
    const newRequest = {
      apiKey,
      limit: Number(limit),
      expiryDate: new Date(expiryDate).toISOString(),
      status: "Menunggu Aktivasi",
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));
    toast({
      title: "Success",
      description: "Permintaan API Key berhasil diajukan.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
          type="date"
          placeholder="Pilih Masa Aktif API Key"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Masukkan Max Requests"
          value={maxRequests}
          onChange={(e) => setMaxRequests(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handlePayment}>
          Ajukan API Key
        </Button>
      </VStack>

      <Modal isOpen={paymentPopup} onClose={() => setPaymentPopup(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pembayaran QRIS</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Spinner />
            ) : (
              qrImageUrl && <Image src={qrImageUrl} alt="QRIS Payment" />
            )}
            <Text>Scan kode QRIS untuk menyelesaikan pembayaran.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={confirmPayment}>
              Konfirmasi Pembayaran
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => setPaymentPopup(false)}
            >
              Batalkan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
