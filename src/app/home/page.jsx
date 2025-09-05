"use client";

import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Text,
  Button,
  Heading,
  useToast,
  Grid,
  GridItem,
  Image,
} from "@chakra-ui/react";
import "./home.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, setDate } from "date-fns";
import withAuth from "../components/AuthComponent/withAuth";

import { CalendarIcon } from "@chakra-ui/icons";
import NavBar from "../components/navBar";
import { relative } from "path";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  const handleRedirectTable = () => {
    router.push("/mesas");
  };

  const handleRedirectRooms = () => {
    router.push("/salas");
  };

  return (
    <>
      <Flex
        height="100vh"
        justifyContent="center"
        alignItems="center"
        flexDirection="column" // Definido como column para alinhar a imagem e os botões verticalmente
        gap={4}
      >
        <Image src="/img/logo.jpg" alt="Logo Newton" mb={4} />
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection="row"
          gap={4}
        >
          <Button
            className="mesas"
            colorScheme="gray"
            onClick={handleRedirectTable}
            fontSize="32px"
            padding="30px 60px"
          >
            Mesas
          </Button>
          <Button
            className="salas"
            colorScheme="gray"
            onClick={handleRedirectRooms}
            fontSize="32px"
            padding="30px 70px"
          >
            Salas
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
export default withAuth(HomePage);
