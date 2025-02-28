import { Flex, Grid, Text, VStack, Box, Image } from "@chakra-ui/react";
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

const specialFeatures = [
  "🎉 Giveaway Group & Event System",
  "🎋 Antilink Protection & Welcome Message",
  "🎐 Scheduled Group Open/Close",
  "🍰 Pinterest Auto Slide Image Fetcher",
  "🎣 Interactive Chat Without Buttons",
  "🌼 Custom Welcome Message for Owner & Premium Users",
  "🤖 AI Chatbot & AI Image Generator",
  "📛 Anti-Bot System",
  "🌟 Jadibot with Pairing Code",
  "🕹️ 40+ Mini Games for Fun",
  "⚔️ 100+ RPG Adventure Games",
  "💡 60+ AI-Powered Features",
  "📊 User Leveling & Role System",
  "👹 Demon Slayer RPG Mode",
  "🏦 Integrated Payment System (Gopay/Dana/Ovo)",
  "📠 Secure Registration with Captcha",
  "🍄 QR Code & Pairing Code System",
];

const commandCategories = [
  { category: "📜 Main Menu & Navigation", count: 30 },
  { category: "📖 Anime & Manga Commands", count: 30 },
  { category: "🌍 Internet Tools & Fetchers", count: 60 },
  { category: "🔞 NSFW Features (For Adults)", count: 30 },
  { category: "🛠️ Various Tools & Utilities", count: 60 },
  { category: "📥 Media Downloader", count: 20 },
  { category: "🎭 Sticker & Meme Generator", count: 10 },
  { category: "🧠 AI Commands & Chatbot", count: 50 },
  { category: "👑 Owner-Only Commands", count: 20 },
  { category: "👥 Group Management", count: 30 },
  { category: "🎉 Fun & Entertainment", count: 40 },
  { category: "🎮 Games & Mini Games", count: 40 },
  { category: "⚔️ RPG Features & Battle System", count: 100 },
  { category: "🔮 Spiritual & Primbon Commands", count: 30 },
  { category: "🕌 Islamic & Religious Tools", count: 10 },
];

const latestUpdates = [
  "✨ *[ RPG ]* New PlanetBuilder Feature",
  "✨ *[ Games ]* WereWolf Game Fixed",
  "✨ *[ System ]* Improved Verification System",
  "✨ *[ System ]* Server Performance Upgrade",
  "✨ *[ Downloader ]* TTS Search Functionality",
  "✨ *[ Fun ]* New 'Cek Oshi' Feature",
  "✨ *[ AI ]* Integrated Gemini AI",
  "✨ *[ AI ]* Improved TTS V2",
  "✨ *[ Tools ]* New Interactive Map Feature",
];

const exclusiveBenefits = [
  "✅ Free API Key for 1 Month (Rose, Yanz, Skizo, Lolhuman, Alya)",
  "✅ One-Time Free Update After Purchase",
  "✅ 100% Open Source (No Encryption)",
];

const systemRequirements = [
  "🔹 NodeJS v18+",
  "🔹 FFMPEG Installed",
  "🔹 IMAGEMAGICK Installed",
  "🔹 Minimum 3GB RAM for Smooth Operation",
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
          <Text fontSize="2xl" fontWeight="bold">
            SELL SCRIPT ZENOVA V.3.6.5
          </Text>
          <Image
            src="https://files.catbox.moe/p3n8vg.jpg"
            alt="Script Zenova"
            rounded="lg"
            mt={3}
          />
          <Text fontSize="xl" fontWeight="bold" color="green.500" mt={3}>
            🏷️ Price: Rp. 35.000
          </Text>
          <Divider my={3} />
        </CardHeader>

        <CardBody>
          <VStack spacing={5} align="stretch">
            {/* Card Fitur */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Special Features
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={3}>
                {specialFeatures.map((feature, index) => (
                  <Flex key={index} align="center" gap={2}>
                    <Box as={FaCheckCircle} size="16px" color="blue.400" />
                    <Text fontSize="sm">{feature}</Text>
                  </Flex>
                ))}
              </Grid>
            </Card>

            {/* Card Command Categories */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Command Categories
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={3}>
                {commandCategories.map((cmd, index) => (
                  <Text key={index} fontSize="sm">
                    {cmd.category} • *[{cmd.count} Cmd]*
                  </Text>
                ))}
              </Grid>
            </Card>

            {/* Card Latest Updates */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Latest Updates
              </Text>
              <VStack spacing={2} align="start" mt={3}>
                {latestUpdates.map((update, index) => (
                  <Text key={index} fontSize="sm">
                    {update}
                  </Text>
                ))}
              </VStack>
            </Card>

            {/* Card Exclusive Benefits */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Exclusive Benefits
              </Text>
              <VStack spacing={2} align="start" mt={3}>
                {exclusiveBenefits.map((benefit, index) => (
                  <Text key={index} fontSize="sm">
                    {benefit}
                  </Text>
                ))}
              </VStack>
            </Card>

            {/* Card System Requirements */}
            <Card
              w="full"
              p={4}
              rounded="lg"
              shadow="md"
              border="1px solid #CBD5E0"
            >
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                System Requirements
              </Text>
              <VStack spacing={2} align="start" mt={3}>
                {systemRequirements.map((req, index) => (
                  <Text key={index} fontSize="sm">
                    {req}
                  </Text>
                ))}
              </VStack>
            </Card>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
