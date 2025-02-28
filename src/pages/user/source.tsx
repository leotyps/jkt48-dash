import { Flex, Grid, Text, VStack, Box, Image, Link } from "@chakra-ui/react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import AppLayout from "@/components/layout/app";
import { NextPageWithLayout } from "@/pages/_app";

const whatsappLink = "https://wa.me/6281234567890?text=Halo%20saya%20ingin%20membeli%20Zenova%20V.3.6.5";

const features = [
  { title: "🎉 Giveaway System", desc: "Support event & group giveaways" },
  { title: "🎋 Antilink Protection", desc: "Prevent unwanted links in group" },
  { title: "🎐 Scheduled Group Control", desc: "Auto open/close group at set times" },
  { title: "🍰 Pinterest Auto Fetcher", desc: "Fetch images with auto-slide" },
  { title: "🤖 AI Chatbot", desc: "Chatbot with AI & image generator" },
  { title: "📛 Anti-Bot System", desc: "Blocks external bots in group" },
  { title: "⚔️ RPG Adventure", desc: "100+ RPG battle system features" },
  { title: "🏦 Integrated Payment", desc: "Supports Gopay, Dana, Ovo" },
  { title: "🟢 JKT48 Live Notif", desc: "Real-time notification when members go live" },
  { title: "🔴 JKT48 End Live Notif", desc: "Real-time notification when live ends" },
  { title: "📸 JKT48 Photo Member", desc: "Fetch latest photos of members" },
];

const ProfilePage: NextPageWithLayout = () => {
  return (
    <Flex direction="column" align="center" p={5} maxW="900px" mx="auto">
      {/* Card Utama */}
      <Card w="full" rounded="2xl" shadow="xl" p={5} border="2px solid #E2E8F0">
        <CardHeader textAlign="center">
          <Image src="https://files.catbox.moe/p3n8vg.jpg" alt="Script Zenova" rounded="lg" mt={3} />
          <Text fontSize="xl" fontWeight="bold" color="green.500" mt={3}>🏷️ Price: Rp. 35.000</Text>
          <Divider my={3} />
        </CardHeader>

        <CardBody>
          <VStack spacing={5} align="stretch">
            {/* Fitur Utama */}
            <Card w="full" p={4} rounded="lg" shadow="md" border="1px solid #CBD5E0" _hover={{ shadow: "lg" }}>
              <Text fontSize="lg" fontWeight="bold" textAlign="center">Special Features</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={3} mt={3}>
                {features.map((feature, index) => (
                  <Flex key={index} align="center" gap={2}>
                    <Box as={FaCheckCircle} size="16px" color="blue.400" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold">{feature.title}</Text>
                      <Text fontSize="xs" color="gray.600">{feature.desc}</Text>
                    </VStack>
                  </Flex>
                ))}
              </Grid>
            </Card>

            {/* Sistem Requirements */}
            <Card w="full" p={4} rounded="lg" shadow="md" border="1px solid #CBD5E0">
              <Text fontSize="lg" fontWeight="bold" textAlign="center">System Requirements</Text>
              <VStack spacing={2} align="start" mt={3}>
                {["🔹 NodeJS v18+", "🔹 FFMPEG Installed", "🔹 IMAGEMAGICK Installed", "🔹 3GB RAM Minimum"].map((req, index) => (
                  <Text key={index} fontSize="sm">{req}</Text>
                ))}
              </VStack>
            </Card>

            {/* Benefit Eksklusif */}
            <Card w="full" p={4} rounded="lg" shadow="md" border="1px solid #CBD5E0">
              <Text fontSize="lg" fontWeight="bold" textAlign="center">Exclusive Benefits</Text>
              <VStack spacing={2} align="start" mt={3}>
                {[
                  "✅ Free API Key (Rose, Yanz, Skizo, Lolhuman, Alya)",
                  "✅ One-Time Free Update",
                  "✅ 100% Open Source (No Encryption)",
                ].map((benefit, index) => (
                  <Text key={index} fontSize="sm">{benefit}</Text>
                ))}
              </VStack>
            </Card>

            {/* Tombol Buy Now */}
            <Flex justify="center" mt={5}>
              <Link href={whatsappLink} isExternal>
                <Button
                  colorScheme="green"
                  size="lg"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  rounded="full"
                  _hover={{ bg: "green.600" }}
                >
                  BUY NOW
                </Button>
              </Link>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
