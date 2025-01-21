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
  data_id: string;
  idn: {
    title: string;
    image: string;
  };
  member: {
    name: string;
    nickname: string;
    img_alt: string;
  };
  created_at: string;
}

interface NewsResponse {
  author: string;
  recents: NewsItem[];
}

const API_URL = "https://api.jkt48connect.my.id/api/recent?api_key=JKTCONNECT";

export default function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]); // Tipe data array NewsItem
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data: NewsResponse = await response.json();

        if (data.recents) {
          // Ambil 5 berita terbaru
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

      {/* Loop untuk menampilkan 5 berita terbaru */}
      {news.map((item) => (
        <Card key={item._id} rounded="2xl" shadow="md" mb={4}>
          <CardHeader p={4}>
            <Heading size="md">{item.idn.title}</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Flex direction="row" gap={4} align="center">
              {/* Gambar member */}
              <Image
                src={item.member.img_alt}
                alt="Member Image"
                boxSize="80px"
                objectFit="cover"
                rounded="full"
              />
              {/* Detail berita */}
              <Flex direction="column" flex="1">
                <Text fontWeight="bold">{item.member.name} / {item.member.nickname}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Flex>
              {/* Gambar berita */}
              <Image
                src={item.idn.image}
                alt="News Image"
                boxSize="120px"
                objectFit="contain"
                rounded="md"
              />
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
}
