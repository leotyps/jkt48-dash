import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Image,
  Spinner,
  Checkbox,
  Textarea,
} from "@chakra-ui/react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from "react";

export default function HomeView() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [maxRequests, setMaxRequests] = useState<string>("");
  const [requests, setRequests] = useState<any[]>([]);
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  useEffect(() => {
    const storedApiKey = localStorage.getItem("jkt48-api-key");
    setApiKey(storedApiKey);

    if (storedApiKey) {
      fetch(`https://api.jkt48connect.my.id/api/check-apikey/${storedApiKey}`)
        .then((res) => res.json())
        .then((data) => setIsAuthorized(data.seller || false))
        .catch(() => setIsAuthorized(false));
    } else {
      setIsAuthorized(false);
    }
  }, []);

  useEffect(() => {
    const savedRequests = localStorage.getItem("apikey-requests");
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  }, []);

  const handleSubmit = async () => {
    if (!limit || !expiryDate || !maxRequests) {
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
    const amount = 50;

    try {
      setIsLoadingPayment(true);
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${amount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&fee=${randomFee}&api_key=JKTCONNECT`
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

        const latestTransactionDate = new Date(latestTransaction.date).getTime();
        const paymentDate = new Date().getTime();

        if (
          latestTransaction.amount === paymentDetails?.totalAmount.toString() &&
          Math.abs(latestTransactionDate - paymentDate) <= 5 * 60 * 1000
        ) {
          toast({
            title: "Success",
            description: "Pembayaran berhasil. Webhook terkirim.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          const newRequest = {
            apiKey: paymentDetails.apiKey,
            limit: paymentDetails.limit,
            maxRequests: paymentDetails.maxRequests,
            expiryDate: paymentDetails.expiryDate,
            status: "Aktif",
          };
          const updatedRequests = [...requests, newRequest];
          setRequests(updatedRequests);
          localStorage.setItem("apikey-requests", JSON.stringify(updatedRequests));

          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [
                {
                  title: "API Key Baru Dibuat",
                  fields: [
                    { name: "API Key", value: paymentDetails.apiKey, inline: true },
                    { name: "Limit", value: paymentDetails.limit, inline: true },
                    { name: "Max Requests", value: paymentDetails.maxRequests, inline: true },
                    { name: "Masa Aktif", value: paymentDetails.expiryDate, inline: true },
                  ],
                  color: 3066993,
                },
              ],
            }),
          });

          setPaymentPopup(false);
        } else {
          toast({
            title: "Error",
            description: "Pembayaran belum terverifikasi atau tidak valid.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memeriksa pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" gap={5} p={5}>
      <Heading>Kelola API Key</Heading>

      {/* Form */}
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

      {/* Dialog */}
      <Dialog open={paymentPopup} onClose={() => setPaymentPopup(false)}>
        <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
        <DialogContent>
          <Text>API Key: {paymentDetails?.apiKey}</Text>
          <Text>Total: {paymentDetails?.totalAmount}</Text>
          <Image src={paymentDetails?.qrImageUrl} alt="QRIS" />
          <Text>Scan QR untuk membayar dan tekan Konfirmasi.</Text>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmPayment} colorScheme="blue">
            Konfirmasi
          </Button>
        </DialogActions>
      </Dialog>
    </Flex>
  );
}
