import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  Spinner,
  Tag,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelfUser } from "@/api/hooks";

export default function DepositView() {
  useEffect(() => {
    window.location.replace("https://wa.me/62857014792453?text=.deposit");
  }, []);

  return null;
}
