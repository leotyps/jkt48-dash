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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

// Define the type for the news item
interface NewsItem {
  _id: string;
  data_id: string;
  created_at: string;
  member: {
    name: string;
    nickname: string;
    img_alt: string;
    img: string;
    url: string;
  };
  idn: {
    title: string;
    image: string;
  };
}

interface NewsResponse {
  author: string;
  recents: NewsItem[];
}

const API_URL = "https://api.jkt48connect.my.id/api/recent?api_key=JKTCONNECT";

export default function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]); // Type the news array
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data: NewsResponse = await response.json();

        if (data.recents) {
          // Get the first 5 news items
          const latestNews = data.recents.slice(0, 5);
          setNews(latestNews);
        } else {
          toast({
            title: "Error",
            description: "Data berita tidak tersedia.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal mengambil data berita.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
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
        Berita JKT48
      </Heading>

      {/* Loop over the 5 latest news and display each in a separate card */}
      {news.map((item) => (
        <Card key={item._id} rounded="2xl" shadow="md" mb={5}>
          <CardHeader p={4}>
            <Heading size="md">{item.idn.title}</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Flex direction="row" align="center" gap={4}>
              {/* Display the image from img_alt */}
              <Image
                src={item.member.img_alt}
                alt={item.member.name}
                boxSize="100px"
                objectFit="cover"
                rounded="md"
              />
              <Flex direction="column">
                <Text fontWeight="bold">{item.member.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  ID: {item.data_id}
                </Text>
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
}
