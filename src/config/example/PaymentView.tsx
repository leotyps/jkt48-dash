import { Box, Flex, Heading, Image, Tag, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function PaymentList() {
  const router = useRouter();

  const handlePaymentClick = (method: string) => {
    if (method === "qris") {
      router.push("/payment/qris"); // Ganti dengan endpoint yang sesuai
    }
  };

  return (
    <VStack spacing={5} align="stretch" p={5}>
      <Heading size="lg" textAlign="center">
        Pilih Metode Pembayaran
      </Heading>

      {/* Card QRIS */}
      <Box
        bg="blue.300"
        p={4}
        borderRadius="md"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        onClick={() => handlePaymentClick("qris")}
        _hover={{ bg: "blue.400" }}
      >
        <Text fontSize="lg" fontWeight="bold" color="white">
          QRIS
        </Text>
        <Image src="/qris-logo.png" alt="QRIS Logo" boxSize="40px" />
      </Box>

      {/* Card PayPal */}
      <Box
        bg="gray.300"
        p={4}
        borderRadius="md"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        opacity={0.6} // PayPal masih Coming Soon
      >
        <Flex align="center">
          <Text fontSize="lg" fontWeight="bold" mr={2}>
            PayPal
          </Text>
          <Tag colorScheme="red" size="sm">
            Coming Soon
          </Tag>
        </Flex>
        <Image src="/paypal-logo.png" alt="PayPal Logo" boxSize="40px" />
      </Box>
    </VStack>
  );
}
