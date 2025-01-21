import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data: NewsResponse = await response.json();
        setNews(data.news);
      } catch (error) {
        console.error("Gagal mengambil data berita:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card>
        <CardHeader
          title="Berita JKT48"
          subheader={`Total Berita: ${news.length}`}
        />
        <CardContent>
          <List>
            {news.map((item) => (
              <ListItem key={item._id} alignItems="flex-start" divider>
                <ListItemAvatar>
                  <Avatar
                    src={`https://jkt48.com${item.label}`}
                    alt="Label"
                    variant="square"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        Tanggal:{" "}
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                      <br />
                      ID: {item.id}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
