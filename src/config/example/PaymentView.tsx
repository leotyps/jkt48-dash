import { Box, Flex, Heading, Image, Tag, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function PaymentList() {
  const router = useRouter();

  const handlePaymentClick = (method: string) => {
    if (method === "qris") {
      router.push("/deposit/qris"); // Ganti dengan endpoint yang sesuai
    }
  };

  return (
    <VStack spacing={6} align="stretch" p={8}>
      <Heading size="xl" textAlign="center">
        Pilih Metode Pembayaran
      </Heading>

      {/* Card QRIS */}
      <Box
        bg="blue.400"
        p={8}
        borderRadius="lg"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        w="100%"
        h="100px"
        _hover={{ bg: "blue.500" }}
        onClick={() => handlePaymentClick("qris")}
      >
        <Text fontSize="2xl" fontWeight="bold" color="white">
          QRIS
        </Text>
        <Image src="https://8030.us.kg/file/MkZ4yUJAu6Zd.png" alt="QRIS Logo" boxSize="80px" />
      </Box>

      {/* Card PayPal */}
      <Box
        bg="gray.400"
        p={8}
        borderRadius="lg"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        h="100px"
        opacity={0.7} // PayPal masih Coming Soon
      >
        <Flex align="center">
          <Text fontSize="2xl" fontWeight="bold" mr={3}>
            PayPal
          </Text>
          <Tag colorScheme="red" size="lg">
            Coming Soon
          </Tag>
        </Flex>
        <Image src="https://8030.us.kg/file/IIqCNN4mm3br.png" alt="PayPal Logo" boxSize="80px" />
      </Box>
    </VStack>
  );
}
