import { Box, Button, Flex, Heading, Icon, Tag, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ChevronRightIcon } from "@chakra-ui/icons";

const features = [
  { name: "Cek API Key", key: "checkApiKey" },
  { name: "Jadwal Theater", key: "getTheater", premium: true },
  { name: "Detail Theater", key: "getTheaterDetail", premium: true },
  { name: "Daftar Event", key: "getEvents" },
  { name: "Detail Event", key: "getEventDetail" },
  { name: "Detail Member", key: "getMemberDetail", premium: true },
  { name: "Daftar Member", key: "getAllMembers" },
  { name: "Live Streaming", key: "getLive", premium: true },
  { name: "Live Streaming Terbaru", key: "getRecentLive" },
  { name: "Buat Pembayaran", key: "createPayment" },
  { name: "Cek Status Pembayaran", key: "checkPaymentStatus" },
  { name: "Berita", key: "getNews", premium: true },
  { name: "Detail Berita", key: "getNewsDetail", premium: true },
  { name: "Brat Generator", key: "getBrat" },
  { name: "Member Ulang Tahun", key: "getBirthdayMembers" },
  { name: "Download TikTok", key: "downloadTiktok" },
];

export default function ApiFeatureList() {
  const router = useRouter();

  const handleRedirect = (key) => {
    router.push(`/api/${key}`);
  };

  return (
    <Flex direction="column" align="center" p={6}>
      <Heading size="lg" mb={5}>
        Daftar Fitur API
      </Heading>

      <Flex direction="column" gap={3} w="90vw">
        {features.map(({ name, key, premium }) => (
          <Flex
            key={key}
            bg="blue.500"
            p={4}
            borderRadius="lg"
            justify="space-between"
            align="center"
            w="100%"
            h="60px"
            cursor="pointer"
            transition="all 0.3s ease"
            _hover={{ bg: "blue.600", transform: "scale(1.03)" }}
            onClick={() => handleRedirect(key)}
          >
            <Box>
              <Text fontSize="md" fontWeight="bold" color="white">
                {name}
              </Text>
              {premium && (
                <Tag size="sm" colorScheme="yellow" mt={1}>
                  Premium
                </Tag>
              )}
            </Box>
            <Icon as={ChevronRightIcon} boxSize={6} color="white" />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
