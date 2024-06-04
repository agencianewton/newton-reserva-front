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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import "./home.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import withAuth from "../components/AuthComponent/withAuth";

import { CalendarIcon } from "@chakra-ui/icons";

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const [startDate, setStartDate] = useState();
  const [tablesAvailability, setTablesAvailability] = useState([]);
  const [tableID, setTableID] = useState();
  const [tableType, setTableType] = useState();
  const [periodReserve, setPeriodReserve] = useState("dia_todo");
  const [tableReserved, setTableReserved] = useState("");
  const [reserveDate, setReserveDate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const handleClickTable = (tableID, tableType, tableCheck) => {
    if (tableCheck == true) {
      alert("Mesa já está reservada");
    } else if (tableID == 4 || tableID == 6 || tableID == 8 || tableID == 10) {
      alert("Você não tem permissão para agendar nessas mesas");
    } else {
      setTableID(tableID);
      setTableType(tableType);
      onOpen();
    }
  };

  const handleDateChange = (date) => {
    setTableReserved("");
    setStartDate(date);

    getInfoDate(date);
  };

  const getInfoDate = async (date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}reservations/${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setTablesAvailability(data.items?.tables);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const reservationTable = async () => {
    if (tableType == 1) {
      setPeriodReserve("dia_todo");
    }

    const data = {
      table_id: tableID,
      date: reserveDate,
      period: periodReserve,
    };
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}reservation/table`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await res.json();
    if (res.ok) {
      toast({
        title: "Reserva realizada com sucesso",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setStartDate(reserveDate);
      getInfoDate(reserveDate);
    } else {
      toast({
        title: "Erro ao reservar",
        description: responseData.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    handleDateChange(new Date());
  }, []);
  return (
    <>
      <Flex justifyContent={"center"} py={12} px={6} wrap={"wrap"}>
        <Stack>
          <Box>
            <Heading textAlign={"center"} fontSize={"2rem"}>
              Selecione a data para verificar disponibilidade de mesas:
            </Heading>
          </Box>
          <Box textAlign={"center"}>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              selected={startDate}
              onChange={(date) => handleDateChange(date)}
              customInput={<Input pr="4.5rem" icon={<CalendarIcon />} />}
            />
          </Box>
        </Stack>
      </Flex>
      {tablesAvailability && (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Box py={12} px={6} boxShadow={"lg"} m={5}>
            <Flex width={"1500px"} overflowX={"auto"}>
              <Box display={"block"} minW={"40px"} ml={5}>
                <Flex justifyContent={"end"}>
                  <Box minH={"25px"}></Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem
                    cursor={"pointer"}
                    className="vertical-text"
                    rowSpan={2}
                    colSpan={1}
                    border={"4px solid #000"}
                    maxW={"40px"}
                    minH={"290px"}
                  >
                    Varanda{" "}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} width={"400px"}>
                <Flex justifyContent={"end"} minH={"36px"}>
                  <Box></Box>
                </Flex>
                <Grid
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem
                    cursor={"pointer"}
                    colSpan={2}
                    bg="red"
                    minH={"75px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {" "}
                    Sala de Reunião
                  </GridItem>
                </Grid>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(4, 1fr)"
                  mt={9}
                >
                  <GridItem colSpan={2} border={"4px solid #000"} minH={"60px"}>
                    Banheiro
                  </GridItem>
                  <GridItem colSpan={2} border={"4px solid #000"} minH={"60px"}>
                    Copa
                  </GridItem>
                </Grid>
              </Box>

              <Box display={"block"} width={"600px"}>
                <Flex justifyContent={"end"} minH={"36px"}>
                  <Box border={"4px solid #000"} width={"250px"}>
                    <Text textAlign={"center"}>Varanda</Text>
                  </Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(3, 1fr)"
                >
                  <GridItem
                    bg="pink"
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    DP/Financ: Adelia{" "}
                  </GridItem>
                  <GridItem
                    bg="pink"
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    DP/Financ: Adelia{" "}
                  </GridItem>
                  <GridItem
                    bg="pink"
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    DP/Financ: Adelia{" "}
                  </GridItem>
                </Grid>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(3, 1fr)"
                >
                  <GridItem
                    bg={
                      tablesAvailability["1"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["1"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"2px solid #000"}
                    p={5}
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["1"]?.table_id,
                        tablesAvailability["1"]?.table_type,
                        tablesAvailability["1"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["1"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      tablesAvailability["1"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["1"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["1"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["1"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["1"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["2"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["2"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["2"]?.table_id,
                        tablesAvailability["2"]?.table_type,
                        tablesAvailability["2"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["2"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      tablesAvailability["2"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["2"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["2"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["2"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["2"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["3"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["3"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["3"]?.table_id,
                        tablesAvailability["3"]?.table_type,
                        tablesAvailability["3"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["3"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      tablesAvailability["3"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["3"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["3"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["3"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["3"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>

              <Box display={"block"} width={"900px"}>
                <Flex justifyContent={"start"}>
                  <Box border={"4px solid #000"} width={"249px"} minH={"36px"}>
                    <Text textAlign={"center"}>Varanda</Text>
                  </Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(5, 1fr)"
                >
                  <GridItem></GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["4"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["4"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["4"]?.table_id,
                        tablesAvailability["4"]?.table_type,
                        tablesAvailability["4"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["4"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      tablesAvailability["4"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["4"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["4"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["5"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["5"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["5"]?.table_id,
                        tablesAvailability["5"]?.table_type,
                        tablesAvailability["5"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["5"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["5"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["5"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["5"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["5"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["5"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["6"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["6"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["6"]?.table_id,
                        tablesAvailability["6"]?.table_type,
                        tablesAvailability["6"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["6"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["6"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["6"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["6"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["7"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["7"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["7"]?.table_id,
                        tablesAvailability["7"]?.table_type,
                        tablesAvailability["7"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["7"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["7"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["7"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["7"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["7"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["7"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(5, 1fr)"
                >
                  <GridItem></GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["8"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["8"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["8"]?.table_id,
                        tablesAvailability["8"]?.table_type,
                        tablesAvailability["8"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["8"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["8"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["8"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["8"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["9"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["9"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["9"]?.table_id,
                        tablesAvailability["9"]?.table_type,
                        tablesAvailability["9"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["9"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["9"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["9"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["9"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["9"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["9"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["10"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["10"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["10"]?.table_id,
                        tablesAvailability["10"]?.table_type,
                        tablesAvailability["10"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["10"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={2}
                    cursor={
                      tablesAvailability["10"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["10"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["10"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["11"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["11"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["11"]?.table_id,
                        tablesAvailability["11"]?.table_type,
                        tablesAvailability["11"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["11"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={2}
                    cursor={
                      tablesAvailability["11"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["11"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["11"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["11"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["11"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} ml={5}>
                <Flex justifyContent={"end"} minH={"36px"}>
                  <Box></Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(4, 1fr)"
                >
                  <GridItem
                    bg="yellow"
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Victor{" "}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["12"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["12"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["12"]?.table_id,
                        tablesAvailability["12"]?.table_type,
                        tablesAvailability["12"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["12"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["12"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["12"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["12"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["12"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["12"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg="yellow"
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Patty{" "}
                  </GridItem>
                  <GridItem
                    bg="blue"
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Ellen{" "}
                  </GridItem>
                </Grid>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(4, 1fr)"
                >
                  <GridItem
                    bg={
                      tablesAvailability["13"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["13"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["13"]?.table_id,
                        tablesAvailability["13"]?.table_type,
                        tablesAvailability["13"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["13"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["13"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["13"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["13"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["13"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["13"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["14"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["14"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["14"]?.table_id,
                        tablesAvailability["14"]?.table_type,
                        tablesAvailability["14"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["14"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["14"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["14"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["14"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["14"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["14"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["15"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["15"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["15"]?.table_id,
                        tablesAvailability["15"]?.table_type,
                        tablesAvailability["15"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["15"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["15"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["15"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["15"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["15"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["15"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["16"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["16"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["16"]?.table_id,
                        tablesAvailability["16"]?.table_type,
                        tablesAvailability["16"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["16"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["16"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["16"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {tablesAvailability["16"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["16"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["16"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
            </Flex>
            <Flex width={"1550px"} overflowX={"auto"}>
              <Box display={"block"} minW={"40px"} ml={5}>
                {" "}
              </Box>

              <Box display={"block"} minW={"200px"} mt={5}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem bg="red" minH={"80px"}>
                    {" "}
                    ENTRADA{" "}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} width={"100%"} mt={5} ml={9}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(6, 1fr)"
                >
                  <GridItem border={"4px solid #000"} p={5} minH={"40px"}>
                    Banheiro
                  </GridItem>
                  <GridItem border={"4px solid #000"} p={5} minH={"40px"}>
                    Banheiro
                  </GridItem>
                  <GridItem
                    border={"4px solid #000"}
                    p={5}
                    minH={"40px"}
                    bg={"#ccc"}
                  >
                    Máquina BI
                  </GridItem>
                  <GridItem border={"4px solid #000"} p={5} minH={"40px"}>
                    Rotativo
                  </GridItem>
                  <GridItem border={"4px solid #000"} p={5} minH={"40px"}>
                    Rotativo
                  </GridItem>
                  <GridItem border={"4px solid #000"} p={5} minH={"40px"}>
                    Rotativo
                  </GridItem>
                </Grid>
              </Box>

              <Box display={"block"} mt={5} ml={5}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(2, 1fr)"
                >
                  <GridItem
                    bg={
                      tablesAvailability["17"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["17"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["17"]?.table_id,
                        tablesAvailability["17"]?.table_type,
                        tablesAvailability["17"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["17"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      tablesAvailability["17"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["17"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["17"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["17"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["17"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    bg={"yellow"}
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Brunno{" "}
                  </GridItem>
                  <GridItem
                    bg={"yellow"}
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Thais{" "}
                  </GridItem>

                  <GridItem
                    bg={"yellow"}
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Ton{" "}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} mt={5}>
                <Grid
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem minH={"40px"} />
                  <GridItem
                    border={"4px solid #000"}
                    p={5}
                    minH={"76px"}
                    mt={2}
                  >
                    Banheiro
                  </GridItem>
                </Grid>
              </Box>
              <Box>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem
                    cursor={"pointer"}
                    className="vertical-text"
                    rowSpan={2}
                    colSpan={1}
                    border={"4px solid #000"}
                    maxW={"40px"}
                    minH={"290px"}
                  >
                    Varanda{" "}
                  </GridItem>
                </Grid>
              </Box>
            </Flex>
          </Box>
        </Flex>
      )}

      {/* MODAL PARA RESERVA DE MESA */}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reserva de Mesa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>MESA: {tableID}</p>
            <p>Selecione a data para a reserva:</p>
            <DatePicker
              selected={reserveDate != null ? reserveDate : startDate}
              onChange={(date) => setReserveDate(date)}
              dateFormat="dd/MM/yyyy"
              customInput={<Input pr="4.5rem" icon={<CalendarIcon />} />}
            />

            {tableType === 3 && (
              <>
                <p>Selecione o período para a reserva:</p>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Dia todo">Dia todo</option>
                </Select>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fechar
            </Button>
            <Button colorScheme="green" onClick={reservationTable}>
              Reservar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default withAuth(HomePage);
