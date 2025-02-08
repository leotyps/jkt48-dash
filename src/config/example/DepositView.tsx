import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  Spinner,
  Checkbox,
  Textarea,
  Tag,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function DepositView() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [nominal, setNominal] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [requests, setRequests] = useState<any[]>([]);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  useEffect(() => {
    const storedApiKey = localStorage.getItem("jkt48-api-key");
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
    const savedRequests = localStorage.getItem("deposit-requests");
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  }, []);

  const handleSubmit = async () => {
    if (!nominal || !phoneNumber) {
      toast({
        title: "Error",
        description: "Nominal dan Nomor telepon harus diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const randomFee = Math.floor(Math.random() * 32) + 4; // Fee antara 4 hingga 32
    const amount = parseInt(nominal);

    try {
      setIsLoadingPayment(true);
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${amount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&fee=${randomFee}&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.dynamicQRIS) {
        setPaymentDetails({
          qrImageUrl: data.qrImageUrl,
          totalAmount: parseInt(data.amount) + randomFee,
          fee: randomFee,
          phoneNumber,
          nominal,
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
            description: "Pembayaran berhasil. Deposit dalam status Pending.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          // Tambahkan deposit ke riwayat
          const newRequest = {
            phoneNumber: paymentDetails.phoneNumber,
            nominal: paymentDetails.nominal,
            fee: paymentDetails.fee,
            status: "Pending",
          };
          const updatedRequests = [...requests, newRequest];
          setRequests(updatedRequests);
          localStorage.setItem("deposit-requests", JSON.stringify(updatedRequests));

          // Kirim webhook dengan status Pending
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              embeds: [
                {
                  title: "Deposit Dibuat (Pending)",
                  fields: [
                    { name: "Nominal", value: paymentDetails.nominal, inline: true },
                    { name: "Fee", value: paymentDetails.fee.toString(), inline: true },
                    {
                      name: "Nomor Telepon",
                      value: paymentDetails.phoneNumber,
                      inline: true,
                    },
                  ],
                  color: 15105570, // Warna kuning
                },
              ],
            }),
          });

          // Ubah status ke Aktif setelah 2-3 menit
          setTimeout(async () => {
            const updatedRequestsAfterActivation = updatedRequests.map((r) =>
              r.phoneNumber === paymentDetails.phoneNumber ? { ...r, status: "Success" } : r
            );
            setRequests(updatedRequestsAfterActivation);
            localStorage.setItem(
              "deposit-requests",
              JSON.stringify(updatedRequestsAfterActivation)
            );

            // Kirim webhook dengan status Success
            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                embeds: [
                  {
                    title: "Deposit Sukses",
                    fields: [
                      { name: "Nominal", value: paymentDetails.nominal, inline: true },
                      { name: "Fee", value: paymentDetails.fee.toString(), inline: true },
                      {
                        name: "Nomor Telepon",
                        value: paymentDetails.phoneNumber,
                        inline: true,
                      },
                    ],
                    color: 3066993, // Warna hijau
                  },
                ],
              }),
            });

            // Tambahkan saldo menggunakan API
            await fetch(
              `https://dash.jkt48connect.my.id/api/auth/add-balance?phone_number=${paymentDetails.phoneNumber}&amount=${paymentDetails.nominal}`
            );

            toast({
              title: "Success",
              description: "Deposit telah berhasil dan saldo Anda telah bertambah.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }, 2 * 60 * 1000); // 2 menit (dapat diubah menjadi 3 menit jika diperlukan)

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
    <Flex direction="column" gap={5}>
      <Heading>Top Up Deposit</Heading>

      {/* Form untuk deposit */}
      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          placeholder="Masukkan Nominal Deposit"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
        />
        <Input
          placeholder="Masukkan Nomor Telepon"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          {isLoadingPayment ? <Spinner /> : "Ajukan Deposit"}
        </Button>
      </VStack>

      {/* Modal untuk konfirmasi pembayaran */}
      <Modal isOpen={paymentPopup} onClose={() => setPaymentPopup(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pembayaran QRIS</ModalHeader>
          <ModalBody>
            <Image
              src={paymentDetails?.qrImageUrl}
              alt="QRIS Payment"
              boxSize="200px"
              marginBottom="20px"
            />
            <Text>
              Total Pembayaran: Rp{paymentDetails?.totalAmount}
            </Text>
            <Text>Fee: Rp{paymentDetails?.fee}</Text>
            <Text>Nomor Telepon: {paymentDetails?.phoneNumber}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={confirmPayment}>
              Konfirmasi Pembayaran
            </Button>
            <Button
              variant="outline"
              onClick={() => setPaymentPopup(false)}
              ml={3}
            >
              Batal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
