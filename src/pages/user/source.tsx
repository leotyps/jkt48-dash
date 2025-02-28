import { Flex, Grid, Text, VStack, Box } from "@chakra-ui/layout";
import {
  Image,
  Card,
  CardBody,
  CardHeader,
  useColorMode,
  Button,
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
  const { colorMode } = useColorMode();

  return (
    <Flex direction="column" align="center" p={5}>
      {/* Banner Image */}
      <Image
        alt="banner"
        src="https://8030.us.kg/file/3gjp59rB7bs8.jpg"
        sx={{ aspectRatio: "1100 / 440" }}
        objectFit="cover"
        rounded="2xl"
        mb={5}
      />

      {/* Features Section */}
      <Card w="full" maxW="800px" rounded="3xl" p={5} shadow="xl">
        <CardHeader fontSize="2xl" fontWeight="600" textAlign="center">
          Fitur Utama
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {features.map((feature, index) => (
              <Flex key={index} align="center" gap={3}>
                <Box as={feature.icon} size="24px" color="blue.400" />
                <Text fontSize="lg" fontWeight="medium">
                  {feature.title}
                </Text>
              </Flex>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Pricing Section */}
      <Card
        w="full"
        maxW="800px"
        rounded="3xl"
        p={5}
        shadow="xl"
        mt={5}
        textAlign="center"
      >
        <CardHeader fontSize="2xl" fontWeight="600">
          Harga
        </CardHeader>
        <CardBody>
          <Text fontSize="3xl" fontWeight="bold" color="green.500">
            250,000 HCoins
          </Text>
          <Button mt={4} colorScheme="blue" size="lg">
            Beli Sekarang
          </Button>
        </CardBody>
      </Card>
    </Flex>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
