import { Box, Flex, Heading, Image, Tag, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function PaymentList() {
  const router = useRouter();

  const handlePaymentClick = (method: string) => {
    if (method === "qris") {
      router.push("/payment/qris"); // Ganti dengan endpoint yang sesuai
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
          bg="blue.500"
          p={4}
          borderRadius="lg"
          justify="space-between"
          align="center"
          w="100%"
          h="90px"
          cursor="pointer"
          _hover={{ bg: "blue.600" }}
          onClick={() => handlePaymentClick("qris")}
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

        {/* Card PayPal */}
        <Flex
          bg="gray.500"
          p={4}
          borderRadius="lg"
          justify="space-between"
          align="center"
          w="100%"
          h="90px"
          opacity={0.7} // PayPal masih Coming Soon
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
    </Flex>
  );
}
