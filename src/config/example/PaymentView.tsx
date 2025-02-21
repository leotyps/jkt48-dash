import { Box, Button, Flex, Heading, Image, Tag, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function PaymentList() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleCardClick = (method: string) => {
    // Hanya QRIS yang dapat diklik
    if (method === "qris") {
      setSelectedMethod(method);
    }
  };

  const handleProceed = () => {
    if (selectedMethod === "qris") {
      router.push("/payment/qris");
    }
  };

  return (
    <Flex direction="column" align="center" p={6}>
      <Heading size="lg" mb={5}>
        Pilih Metode Pembayaran
      </Heading>

      <Flex direction="column" gap={4} w="90vw">
        {/* Card QRIS */}
        <Flex
          bg={selectedMethod === "qris" ? "blue.600" : "blue.500"}
          p={4}
          borderRadius="lg"
          justify="space-between"
          align="center"
          w="100%"
          h="90px"
          cursor="pointer"
          transition="all 0.3s ease"
          transform={selectedMethod === "qris" ? "scale(1.03)" : "scale(1)"}
          boxShadow={selectedMethod === "qris" ? "md" : "none"}
          onClick={() => handleCardClick("qris")}
        >
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="white">
              QRIS
            </Text>
            <Text fontSize="sm" color="white">
              Bayar dengan QRIS dari berbagai aplikasi e-wallet dan bank.
            </Text>
          </Box>
          <Image
            src="https://8030.us.kg/file/MkZ4yUJAu6Zd.png"
            alt="QRIS Logo"
            boxSize="70px"
          />
        </Flex>

        {/* Card PayPal (Coming Soon, tidak dapat diklik) */}
        <Flex
          bg="gray.500"
          p={4}
          borderRadius="lg"
          justify="space-between"
          align="center"
          w="100%"
          h="90px"
          opacity={0.7}
          cursor="not-allowed"
          pointerEvents="none"
        >
          <Box>
            <Flex align="center">
              <Text fontSize="lg" fontWeight="bold" mr={2} color="white">
                PayPal
              </Text>
              <Tag colorScheme="red" size="sm">
                Coming Soon
              </Tag>
            </Flex>
            <Text fontSize="sm" color="white">
              Segera hadir, pembayaran mudah dengan PayPal.
            </Text>
          </Box>
          <Image
            src="https://8030.us.kg/file/IIqCNN4mm3br.png"
            alt="PayPal Logo"
            boxSize="70px"
          />
        </Flex>
      </Flex>

      {/* Navbar button yang muncul setelah memilih metode */}
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
          <Button colorScheme="teal" onClick={handleProceed}>
            Lanjut ke {selectedMethod.toUpperCase()}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
