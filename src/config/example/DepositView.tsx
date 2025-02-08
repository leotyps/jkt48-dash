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
  Badge,
  Tag,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function HomeView() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [selectedDepositRequest, setSelectedDepositRequest] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  useEffect(() => {
    const savedRequests = localStorage.getItem("deposit-requests");
    if (savedRequests) setDepositRequests(JSON.parse(savedRequests));
  }, []);

  const handleSubmit = async () => {
    if (!depositAmount || !phoneNumber) {
      toast({
        title: "Error",
        description: "Semua input wajib diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fee = 4;
    const totalAmount = parseInt(depositAmount) + fee;

    try {
      setIsLoadingPayment(true);
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${totalAmount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&fee=${fee}&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.dynamicQRIS) {
        setPaymentDetails({
          qrImageUrl: data.qrImageUrl,
          totalAmount: totalAmount,
          fee,
          phoneNumber,
          depositAmount,
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
          // Add balance to the user's account
          const addBalanceResponse = await fetch(
            `https://dash.jkt48connect.my.id/api/auth/add-balance?phone_number=${paymentDetails.phoneNumber}&amount=${depositAmount}`
          );
          const addBalanceData = await addBalanceResponse.json();

          if (addBalanceResponse.ok && addBalanceData.success) {
            toast({
              title: "Success",
              description: "Pembayaran berhasil. Deposit Anda sudah ditambahkan.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            // Update deposit request status
            const newDepositRequest = {
              phoneNumber: paymentDetails.phoneNumber,
              depositAmount: paymentDetails.depositAmount,
              totalAmount: paymentDetails.totalAmount,
              status: "Success",
            };
            const updatedRequests = [...depositRequests, newDepositRequest];
            setDepositRequests(updatedRequests);
            localStorage.setItem("deposit-requests", JSON.stringify(updatedRequests));

            // Send webhook notification
            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                embeds: [
                  {
                    title: "Deposit Berhasil",
                    fields: [
                      { name: "Nomor", value: paymentDetails.phoneNumber, inline: true },
                      { name: "Nominal", value: `Rp${paymentDetails.depositAmount}`, inline: true },
                      { name: "Total Pembayaran", value: `Rp${paymentDetails.totalAmount}`, inline: true },
                    ],
                    color: 3066993, // Green
                  },
                ],
              }),
            });

            setPaymentPopup(false);
          } else {
            toast({
              title: "Error",
              description: "Gagal menambahkan saldo.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
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

  const handleDelete = async (phoneNumberToDelete: string) => {
    if (!deleteConfirmation || !deleteReason) {
      toast({
        title: "Error",
        description: "Anda harus menyetujui kebijakan dan mengisi alasan.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedRequests = depositRequests.filter(
      (req) => req.phoneNumber !== phoneNumberToDelete
    );
    setDepositRequests(updatedRequests);
    localStorage.setItem("deposit-requests", JSON.stringify(updatedRequests));

    // Kirim webhook penghapusan
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "Deposit Dihapus",
            fields: [
              { name: "Nomor", value: phoneNumberToDelete, inline: true },
              { name: "Alasan", value: deleteReason, inline: false },
            ],
            color: 15158332, // Red
          },
        ],
      }),
    });

    setDeletePopup(false);
    toast({
      title: "Success",
      description: "Deposit berhasil dihapus.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Flex direction="column" gap={5}>
      <Heading>Top Up Deposit</Heading>

      {/* Form untuk Deposit */}
      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          placeholder="Masukkan Nominal Top Up"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <Input
          placeholder="Masukkan Nomor"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          {isLoadingPayment ? <Spinner /> : "Ajukan Top Up Deposit"}
        </Button>
      </VStack>

      {/* Modal untuk konfirmasi pembayaran */}
      <Modal isOpen={paymentPopup} onClose={() => setPaymentPopup(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Konfirmasi Pembayaran</ModalHeader>
          <ModalBody>
            {paymentDetails && (
              <>
                <Text>
                  Nomor: {paymentDetails.phoneNumber} <br />
                  Nominal: Rp{paymentDetails.depositAmount} <br />
                  Total Pembayaran: Rp{paymentDetails.totalAmount}
                </Text>
                <Image src={paymentDetails.qrImageUrl} alt="QRIS" boxSize="200px" />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={confirmPayment}>
              Konfirmasi Pembayaran
            </Button>
            <Button variant="ghost" onClick={() => setPaymentPopup(false)}>
              Batal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Deposit Requests Table */}
      <VStack align="stretch">
        <Heading size="md">Riwayat Deposit</Heading>
        {depositRequests.length === 0 ? (
          <Text>No deposit requests yet.</Text>
        ) : (
          depositRequests.map((request, index) => (
            <Flex
              key={index}
              align="center"
              justify="space-between"
              border="1px solid #ccc"
              p={3}
              borderRadius="md"
            >
              <Text>
                {request.phoneNumber} <br />
                Nominal: Rp{request.depositAmount} <br />
                Status:{" "}
                <Badge colorScheme={request.status === "Success" ? "green" : "red"}>
                  {request.status}
                </Badge>
              </Text>
            </Flex>
          ))
        )}
      </VStack>
    </Flex>
  );
}
