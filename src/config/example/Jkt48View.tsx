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

// Definisikan tipe data untuk berita
interface NewsItem {
  _id: string;
  id: string;
  date: string;
  label: string;
  title: string;
}

interface NewsResponse {
  author: string;
  news: NewsItem[];
  page: number;
  perpage: number;
  total_count: number;
}

const API_URL = "https://api.jkt48connect.my.id/api/news?api_key=JKTCONNECT";

export default function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]); // Tipe data array NewsItem
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data: NewsResponse = await response.json();

        if (data.news) {
          // Mengurutkan berita berdasarkan tanggal terbaru dan mengambil 4 berita pertama
          const sortedNews = data.news
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4); // Ambil 4 berita terbaru

          setNews(sortedNews);
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

      {/* Card besar untuk 4 berita terbaru */}
      <Card rounded="2xl" shadow="md">
        <CardHeader p={4}>
          <Heading size="md">Daftar Berita Terbaru</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          {news.map((item) => (
            <Flex
              key={item._id}
              direction="row"
              align="center"
              gap={4}
              mb={4}
              _last={{ mb: 0 }}
            >
              {/* Gambar label */}
              <Image
                src={`https://jkt48.com${item.label}`}
                alt="Label"
                boxSize="50px"
                objectFit="contain"
                rounded="md"
              />

              {/* Detail berita */}
              <Flex direction="column">
                <Text fontWeight="bold">{item.title}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  ID: {item.id}
                </Text>
              </Flex>
            </Flex>
          ))}
        </CardBody>
      </Card>
    </Flex>
  );
}
