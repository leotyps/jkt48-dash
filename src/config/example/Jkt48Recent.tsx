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

// Define types for the new API response
interface Member {
  name: string;
  nickname: string;
  img_alt: string;
  img: string;
}

interface NewsItem {
  _id: string;
  data_id: string;
  created_at: string;
  member: Member;
  idn: {
    title: string;
    image: string;
  };
}

interface NewsResponse {
  recents: NewsItem[];
}

const API_URL = "https://api.jkt48connect.my.id/api/recent?api_key=JKTCONNECT";

export default function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]); // Data array of NewsItem
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data: NewsResponse = await response.json();

        if (data.recents) {
          // Take only 5 latest news
          const latestNews = data.recents.slice(0, 5);
          setNews(latestNews);
        } else {
          toast({
            title: "Error",
            description: "No news data available.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch news data.",
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
        Latest JKT48 News
      </Heading>

      {/* Display individual cards for each news item */}
      {news.map((item) => (
        <Card key={item._id} rounded="2xl" shadow="md" mb={5}>
          <CardHeader p={4}>
            <Heading size="md">{item.idn.title}</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Flex direction="row" align="center" gap={4}>
              {/* Left side: Member information */}
              <Flex direction="column" flex={1}>
                <Text fontWeight="bold">{item.member.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Flex>

              {/* Right side: Image */}
              <Image
                src={item.member.img_alt}
                alt={item.member.name}
                boxSize="100px"
                objectFit="cover"
                borderRadius="md"
              />
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
}
