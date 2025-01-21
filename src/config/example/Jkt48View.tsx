import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { getNews } from "jkt48connect-cli";

const Jkt48View = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getNews("JKTCONNECT");
        setNewsData(response.news);
      } catch (err) {
        setError("Gagal memuat berita. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="red.500">
          {error}
        </Text>
      </Center>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={5} fontSize="2xl">
        Berita JKT48
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
        {newsData.map((newsItem) => (
          <Card key={newsItem._id} borderWidth="1px" rounded="lg" overflow="hidden">
            <Image
              src={`https://jkt48.com${newsItem.label}`}
              alt={newsItem.title}
              objectFit="cover"
              h="150px"
              w="100%"
            />
            <CardHeader>
              <Heading fontSize="lg" noOfLines={2}>
                {newsItem.title}
              </Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.500">
                {new Date(newsItem.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Jkt48View;
