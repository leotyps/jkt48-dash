import {
  Flex,
  Grid,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Image,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

const API_URL = "https://api.jkt48connect.my.id/api/news?api_key=JKTCONNECT";

export default function NewsView() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.news) {
          setNews(data.news);
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
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={5}
      >
        {news.map((item) => (
          <Card key={item._id} rounded="2xl" shadow="md">
            <CardHeader p={4}>
              <Image
                src={`https://jkt48.com${item.label}`}
                alt="Label"
                boxSize="50px"
                objectFit="contain"
              />
            </CardHeader>
            <CardBody>
              <Heading size="md" mb={2}>
                {item.title}
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Tanggal: {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Text fontSize="sm" color="gray.600">
                ID: {item.id}
              </Text>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
