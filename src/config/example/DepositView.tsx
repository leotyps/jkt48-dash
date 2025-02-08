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
  const [nominal, setNominal] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  useEffect(() => {
    const savedDeposits = localStorage.getItem("deposit-history");
    if (savedDeposits) setDepositHistory(JSON.parse(savedDeposits));
  }, []);

  const handleSubmit = async () => {
    if (!nominal || !phoneNumber) {
      toast({
        title: "Error",
        description: "Semua input wajib diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fee = 4; // Fee tetap
    const amount = parseInt(nominal);
    const totalAmount = amount + fee; // Jumlah total dengan fee

    try {
      setIsLoadingPayment(true);
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${totalAmount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&fee=${fee}&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.dynamicQRIS) {
        setPaymentDetails({
          qrImageUrl: data.qrImageUrl,
          totalAmount,
          fee,
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
            description: "Pembayaran berhasil, saldo akan ditambahkan.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          // Tambahkan saldo menggunakan API
          const addBalanceResponse = await fetch(
            `https://dash.jkt48connect.my.id/api/auth/add-balance?phone_number=${phoneNumber}&amount=${nominal}`,
            { method: "GET" }
          );
          const addBalanceData = await addBalanceResponse.json();

          if (addBalanceResponse.ok && addBalanceData.success) {
            // Tambahkan riwayat deposit
            const newDeposit = {
              phoneNumber,
              nominal,
              status: "Success",
              date: new Date().toLocaleString(),
            };
            const updatedDeposits = [...depositHistory, newDeposit];
            setDepositHistory(updatedDeposits);
            localStorage.setItem("deposit-history", JSON.stringify(updatedDeposits));

            // Kirim webhook deposit sukses
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                embeds: [
                  {
                    title: "Deposit Sukses",
                    fields: [
                      { name: "Nominal", value: nominal, inline: true },
                      { name: "Nomor", value: phoneNumber, inline: true },
                      { name: "Status", value: "Success", inline: true },
                    ],
                    color: 3066993, // Warna hijau
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

  const handleDelete = async (depositToDelete: any) => {
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

    const updatedDeposits = depositHistory.filter(
      (deposit) => deposit.phoneNumber !== depositToDelete.phoneNumber
    );
    setDepositHistory(updatedDeposits);
    localStorage.setItem("deposit-history", JSON.stringify(updatedDeposits));

    // Kirim webhook penghapusan deposit
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "Deposit Dihapus",
            fields: [
              { name: "Nominal", value: depositToDelete.nominal, inline: true },
              { name: "Nomor", value: depositToDelete.phoneNumber, inline: true },
              { name: "Alasan", value: deleteReason, inline: false },
            ],
            color: 15158332, // Warna merah
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

      {/* Form untuk deposit */}
      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          placeholder="Masukkan Nominal Top Up"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Masukkan Nomor Pengguna"
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
            <Text>Nominal: {paymentDetails?.nominal}</Text>
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

      {/* Daftar deposit */}
      {depositHistory.map((deposit, idx) => (
        <Flex key={idx} justify="space-between" p={4} borderWidth={1}>
          <VStack align="start">
            <Text>{deposit.phoneNumber}</Text>
            <Text>{deposit.nominal}</Text>
            <Tag colorScheme="green">{deposit.status}</Tag>
            <Text>{deposit.date}</Text>
          </VStack>
          <Button colorScheme="red" onClick={() => setDeletePopup(true)}>
            Hapus
          </Button>
        </Flex>
      ))}

      {/* Popup untuk penghapusan */}
      <Modal isOpen={deletePopup} onClose={() => setDeletePopup(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Hapus Deposit</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="Alasan penghapusan"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <Checkbox
              isChecked={deleteConfirmation}
              onChange={() => setDeleteConfirmation(!deleteConfirmation)}
            >
              Saya setuju dengan kebijakan
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={() => handleDelete(depositHistory[0])}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
