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
  Tag,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelfUser } from "@/api/hooks";

export default function DepositView() {
  const user = useSelfUser();
  const [amount, setAmount] = useState<string>("");
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  useEffect(() => {
    const savedDeposits = localStorage.getItem("deposit-history");
    if (savedDeposits) setDepositHistory(JSON.parse(savedDeposits));
  }, []);

  const handleDeposit = async () => {
    if (!user?.id || !amount) {
      toast({
        title: "Error",
        description: "User ID dan nominal harus diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const randomFee = Math.floor(Math.random() * 29) + 4; // Fee antara 4 - 32
    const totalAmount = parseInt(amount) + randomFee;

    try {
      setIsLoadingPayment(true);
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${amount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&fee=${randomFee}&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.dynamicQRIS) {
        setPaymentDetails({
          qrImageUrl: data.qrImageUrl,
          totalAmount,
          fee: randomFee,
          userId: user.id,
          amount,
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

        if (
          latestTransaction.amount === paymentDetails?.totalAmount.toString()
        ) {
          // Tambahkan saldo dengan API
          await fetch(
            `https://dash.jkt48connect.my.id/api/auth/add-balance?id=${paymentDetails.userId}&amount=${paymentDetails.amount}`
          );

          // Simpan riwayat deposit
          const newDeposit = {
            userId: paymentDetails.userId,
            amount: paymentDetails.amount,
            fee: paymentDetails.fee,
            status: "Success",
          };
          const updatedDeposits = [...depositHistory, newDeposit];
          setDepositHistory(updatedDeposits);
          localStorage.setItem("deposit-history", JSON.stringify(updatedDeposits));

          // Kirim webhook dengan status Success
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [
                {
                  title: "Deposit Berhasil",
                  fields: [
                    { name: "User ID", value: paymentDetails.userId, inline: true },
                    { name: "Nominal", value: paymentDetails.amount, inline: true },
                    { name: "Fee", value: paymentDetails.fee, inline: true },
                  ],
                  color: 3066993, // Warna hijau
                },
              ],
            }),
          });

          toast({
            title: "Success",
            description: "Saldo telah ditambahkan.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          setPaymentPopup(false);
        } else {
          toast({
            title: "Error",
            description: "Pembayaran tidak valid atau belum terverifikasi.",
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

      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          placeholder="Masukkan Nominal Deposit"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleDeposit}>
          {isLoadingPayment ? <Spinner /> : "Top Up Saldo"}
        </Button>
      </VStack>
    </Flex>
  );
}
