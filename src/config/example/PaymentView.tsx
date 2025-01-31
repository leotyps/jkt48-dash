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
    <Flex direction="column" align="center" p={8}>
      <Heading size="xl" mb={6}>
        Pilih Metode Pembayaran
      </Heading>

      <Flex direction="column" gap={6} w="90vw">
        {/* Card QRIS */}
        <Flex
          bg="blue.400"
          p={8}
          borderRadius="lg"
          justify="space-between"
          align="center"
          w="100%"
          h="120px"
          cursor="pointer"
          _hover={{ bg: "blue.500" }}
          onClick={() => handlePaymentClick("qris")}
        >
          <Text fontSize="2xl" fontWeight="bold" color="white">
            QRIS
          </Text>
          <Image src="https://8030.us.kg/file/MkZ4yUJAu6Zd.png" alt="QRIS Logo" boxSize="100px" />
        </Flex>

        {/* Card PayPal */}
        <Flex
          bg="gray.400"
          p={8}
          borderRadius="lg"
          justify="space-between"
          align="center"
          w="100%"
          h="120px"
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
          <Image src="https://8030.us.kg/file/IIqCNN4mm3br.png" alt="PayPal Logo" boxSize="100px" />
        </Flex>
      </Flex>
    </Flex>
  );
}
