import {
  Flex,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Image,
  Spinner,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

// Definisikan tipe data
interface NewsItem {
  _id: string;
  id: string;
  date: string;
  label: string;
  title: string;
}

interface RecentLiveItem {
  _id: string;
  idn: {
    title: string;
    image: string;
  };
  member: {
    name: string;
    img: string;
  };
  live_info: {
    date: {
      start: string;
    };
  };
}

const NEWS_API_URL = "https://api.jkt48connect.my.id/api/news?api_key=JKTCONNECT";
const RECENT_API_URL = "https://api.jkt48connect.my.id/api/recent?api_key=JKTCONNECT";

export default function NewsAndRecentsView() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [recents, setRecents] = useState<RecentLiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Start loading

        // Fetch News
        const newsResponse = await fetch(NEWS_API_URL);
        if (!newsResponse.ok) throw new Error("Failed to fetch news data");
        const newsData = await newsResponse.json();
        setNews(newsData.news.slice(0, 4)); // Ambil 4 berita terbaru

        // Fetch Recents
        const recentsResponse = await fetch(RECENT_API_URL);
        if (!recentsResponse.ok) throw new Error("Failed to fetch recent live data");
        const recentsData = await recentsResponse.json();
        setRecents(recentsData.recents.slice(0, 5)); // Ambil 5 recent live
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Gagal mengambil data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={5} p={5}>
      <Heading as="h1" size="lg" mb={5}>
        Berita dan Recent Live JKT48
      </Heading>

      {/* Card Berita */}
      <Card rounded="2xl" shadow="md">
        <CardHeader p={4}>
          <Heading size="md">Berita Terbaru</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          {news.map((item) => (
            <Flex key={item._id} direction="row" align="center" gap={4} mb={4}>
              {/* Update URL jika label belum terisi dengan benar */}
              <Image
                src={item.label ? `https://jkt48.com${item.label}` : "/fallback-image.jpg"}
                alt="Label"
                boxSize="50px"
                objectFit="contain"
                rounded="md"
              />
              <Flex direction="column">
                <Text fontWeight="bold">{item.title}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Flex>
            </Flex>
          ))}
        </CardBody>
      </Card>

      {/* Recent Lives */}
      <Heading size="md" mt={6}>
        Recent Live
      </Heading>
      <Flex direction="column" gap={4}>
        {recents.map((recent) => (
          <Card key={recent._id} rounded="2xl" shadow="md">
            <CardBody>
              <Flex direction="row" align="center" justify="space-between">
                {/* Informasi recent */}
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {recent.idn.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Oleh: {recent.member.name}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(recent.live_info.date.start).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </Text>
                </Box>

                {/* Thumbnail */}
                <Image
                  src={recent.idn.image || "/fallback-thumbnail.jpg"}
                  alt={recent.idn.title}
                  boxSize="100px"
                  objectFit="cover"
                  rounded="lg"
                />
              </Flex>
            </CardBody>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
