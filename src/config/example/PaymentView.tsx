import { useState } from "react";
import { Box, Button, Flex, Grid, Heading, Image, Tag, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

// Buat komponen motion untuk membungkus elemen Chakra UI
const MotionBox = motion(Box);

export default function DepositView() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleCardClick = (method: string) => {
    // Hanya metode QRIS yang bisa dipilih karena PayPal masih Coming Soon
    if (method === "qris") {
      setSelectedMethod(method);
    }
  };

  const handleProceed = () => {
    if (selectedMethod === "qris") {
      router.push("/payment/qris"); // Endpoint khusus untuk pembayaran QRIS
    }
  };

  return (
    <Flex direction="column" align="center" justify="center" p={6} minH="100vh" bg="gray.50">
      <Heading mb={8} size="xl">
        Deposit / Top-Up Saldo
      </Heading>

      <Grid
        templateColumns={["1fr", "1fr 1fr"]}
        gap={6}
        w={["90vw", "80vw"]}
        mb={12}
      >
        {/* Card QRIS */}
        <MotionBox
          as={Flex}
          direction="column"
          bg={selectedMethod === "qris" ? "blue.600" : "blue.500"}
          p={6}
          borderRadius="lg"
          justify="space-between"
          align="center"
          h="150px"
          cursor="pointer"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          onClick={() => handleCardClick("qris")}
        >
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="white">
              QRIS
            </Text>
            <Text fontSize="md" color="whiteAlpha.900" mt={1}>
              Bayar dengan QRIS dari berbagai aplikasi e-wallet dan bank.
            </Text>
          </Box>
          <Image
            src="https://8030.us.kg/file/MkZ4yUJAu6Zd.png"
            alt="QRIS Logo"
            boxSize="80px"
          />
        </MotionBox>

        {/* Card PayPal (Coming Soon, tidak dapat diklik) */}
        <MotionBox
          as={Flex}
          direction="column"
          bg="gray.500"
          p={6}
          borderRadius="lg"
          justify="space-between"
          align="center"
          h="150px"
          opacity={0.6}
          cursor="not-allowed"
          whileHover={{ scale: 1.0 }} // Tidak ada animasi karena tidak bisa diklik
        >
          <Box textAlign="center">
            <Flex align="center" justify="center">
              <Text fontSize="2xl" fontWeight="bold" color="white" mr={2}>
                PayPal
              </Text>
              <Tag colorScheme="red" size="md">
                Coming Soon
              </Tag>
            </Flex>
            <Text fontSize="md" color="whiteAlpha.900" mt={1}>
              Segera hadir, pembayaran mudah dengan PayPal.
            </Text>
          </Box>
          <Image
            src="https://8030.us.kg/file/IIqCNN4mm3br.png"
            alt="PayPal Logo"
            boxSize="80px"
          />
        </MotionBox>
      </Grid>

      {/* Navbar Button (muncul saat metode dipilih) */}
      {selectedMethod && (
        <Flex
          position="fixed"
          bottom={0}
          left={0}
          w="100%"
          p={4}
          justify="center"
          align="center"
          zIndex={10}
        >
          <Button colorScheme="teal" size="lg" onClick={handleProceed}>
            Lanjut ke {selectedMethod.toUpperCase()}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
