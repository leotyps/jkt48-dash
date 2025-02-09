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
  Textarea,
  Checkbox,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function DepositView() {
  const [nominal, setNominal] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [requests, setRequests] = useState<any[]>([]);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  const handleSubmit = async () => {
    if (!nominal || !phoneNumber) {
      toast({
        title: "Error",
        description: "Nominal dan Nomor Telepon harus diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const randomFee = Math.floor(Math.random() * 250) + 1;
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
          totalAmount: amount + randomFee,
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

          // Tambahkan riwayat deposit dengan status Pending
          const newRequest = {
            phoneNumber: paymentDetails.phoneNumber,
            nominal: paymentDetails.nominal,
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
                    { name: "Nomor Telepon", value: paymentDetails.phoneNumber, inline: true },
                    { name: "Total Pembayaran", value: paymentDetails.totalAmount.toString(), inline: true },
                  ],
                  color: 15105570, // Warna kuning
                },
              ],
            }),
          });

          // Ubah status ke Sukses setelah 2-3 menit
          setTimeout(async () => {
            const updatedRequestsAfterActivation = updatedRequests.map((r) =>
              r.phoneNumber === paymentDetails.phoneNumber
                ? { ...r, status: "Success" }
                : r
            );
            setRequests(updatedRequestsAfterActivation);
            localStorage.setItem(
              "deposit-requests",
              JSON.stringify(updatedRequestsAfterActivation)
            );

            // Tambahkan saldo ke pengguna
            await fetch(
              `https://dash.jkt48connect.my.id/api/auth/add-balance?phone_number=${paymentDetails.phoneNumber}&amount=${paymentDetails.nominal}`
            );

            // Kirim webhook dengan status Sukses
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
                      { name: "Nomor Telepon", value: paymentDetails.phoneNumber, inline: true },
                    ],
                    color: 3066993, // Warna hijau
                  },
                ],
              }),
            });

            toast({
              title: "Success",
              description: "Deposit berhasil ditambahkan.",
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
      <Heading>Deposit Saldo</Heading>

      {/* Form untuk Deposit */}
      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          placeholder="Masukkan Nominal Top Up"
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
          <ModalHeader>Konfirmasi Pembayaran QRIS</ModalHeader>
          <ModalBody>
            <Text>Total Pembayaran: {paymentDetails?.totalAmount}</Text>
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

      {/* Riwayat Deposit */}
      {requests.map((req, idx) => (
        <Flex key={idx} justify="space-between" p={4} borderWidth={1} align="center">
          <Flex direction="column">
            <Text fontWeight="bold">{req.phoneNumber}</Text>
            <Text>Status: {req.status}</Text>
            <Text>Nominal: {req.nominal}</Text>
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
