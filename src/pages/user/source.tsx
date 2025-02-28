import { Flex, Grid, Text, VStack, Box } from "@chakra-ui/layout";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
} from "@chakra-ui/react";
import { RiVipCrownFill } from "react-icons/ri";
import { FaServer, FaCoins, FaBug, FaCogs, FaKey } from "react-icons/fa";
import AppLayout from "@/components/layout/app";
import { NextPageWithLayout } from "@/pages/_app";

const features = [
  { icon: FaCoins, title: "Deposit Coin Automatic" },
  { icon: RiVipCrownFill, title: "Premium User System" },
  { icon: FaKey, title: "Premium API Key" },
  { icon: FaCogs, title: "REST API Features" },
  { icon: FaServer, title: "Server Pterodactyl Management" },
  { icon: FaCogs, title: "Admin System" },
  { icon: FaServer, title: "Integrated Discord Logging" },
  { icon: FaBug, title: "Minim Bug" },
  { icon: FaCogs, title: "Kode Berkualitas Tinggi" },
];

const ProfilePage: NextPageWithLayout = () => {
  return (
    <Flex direction="column" align="center" p={5}>
      {/* Card Utama */}
      <Card
        w="full"
        maxW="700px"
        rounded="2xl"
        shadow="xl"
        p={5}
        border="2px solid #E2E8F0"
      >
        <CardHeader textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">Profil</Text>
          <Divider my={2} />
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Card Harga */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Harga
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500" textAlign="center">
                250,000 HCoins
              </Text>
              <Button mt={3} colorScheme="blue" size="lg" w="full">
                Beli Sekarang
              </Button>
            </Card>

            {/* Card Fitur */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Fitur Utama
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={3} mt={3}>
                {features.map((feature, index) => (
                  <Flex key={index} align="center" gap={2}>
                    <Box as={feature.icon} size="18px" color="blue.400" />
                    <Text fontSize="md">{feature.title}</Text>
                  </Flex>
                ))}
              </Grid>
            </Card>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
