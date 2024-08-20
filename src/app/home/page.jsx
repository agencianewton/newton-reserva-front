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
import NavBar from "../components/navBar";

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
  const [roomsAvailability, setRoomsAvailability] = useState([])
  const [roomID, setRoomID] = useState();

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

  const handleClickRoom = (roomID, roomCheck) => {
    if (roomCheck == true) {
      alert("Mesa já está reservada");
    } else {
      setRoomID(roomID);
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
          console.log(data.items)
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const getInfoRooms = async (id, date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}room/${id}/${formattedDate}`,
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
          setRoomsAvailability(data.items?.tables);
          console.log(data.items)
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

  const reservationRoom = async () => {
    if (tableType == 1) {
      setPeriodReserve("dia_todo");
    }

    const data = {
      rooms_id: roomID,
      date: reserveDate,
      period: periodReserve,
    };
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}reservation/room`,
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
      getInfoRoom(reserveDate);
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
        <Flex>
          <Box py={12} px={6} height={"1000px"} boxShadow={"lg"} marginLeft={"-38px"} className={"container"}>
            <Flex width={"2830px"} height={"780px"} marginTop={"63px"} paddingTop={"20px"} overflowY={"auto"} overflowX={"auto"}>
              <Box display={"block"} minW={"40px"} ml={5}>
                <Flex justifyContent={"end"}>
                  <Box minH={"25px"}></Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                  width={"90px"}
                  borderRight={"1px"}
                  marginRight={"8px"}
                  marginLeft={"-10px"}
                  marginTop={"196px"}
                >
                  <GridItem
                  bg={
                    tablesAvailability["2"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["2"]?.availability?.Tarde === "Livre"
                      ? "url('/img/varanda_livre.png')"
                      : "url('/img/varanda_ocupada.png')"
                  }
                  backgroundSize={"cover"}
                  transform={"rotate(360deg)"}
                    className="vertical-text"
                    rowSpan={2}
                    colSpan={1}
                    border={"1px solid #000"}
                    minW={"90px"}
                    minH={"380px"}
                    borderLeft={"3px solid"}
                    onClick={() =>
                      handleClickRoom(
                        roomsAvailability["2"]?.rooms_id,
                        roomsAvailability["2"]?.availability?.Manha ===
                          "Livre" &&
                          roomsAvailability["2"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      roomsAvailability["2"]?.availability?.Manha ===
                        "Livre" &&
                      roomsAvailability["2"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {roomsAvailability["2"]?.availability?.Manha === "Livre" &&
                    roomsAvailability["2"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : roomsAvailability["2"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} width={"500px"} maxH={"100px"} marginTop={"20px"} paddingRight={"50px"}>
                <Flex justifyContent={"end"} minH={"36px"}>
                  <Box></Box>
                </Flex>
                <Grid
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                  marginTop={"13px"}
                >
                  <GridItem
                    cursor={"pointer"}
                    colSpan={2}
                    bg="red"
                    minH={"75px"}
                    border={"1px solid #000"}
                    height={"300px"}
                    width={"550px"}
                    p={5}
                    borderTop={"4px solid"}
                    borderLeft={"4px solid"}
                    marginTop={"1px"}
                    marginLeft={""}
                  >
                    {" "}
                    Sala de Reunião
                  </GridItem>
                </Grid>
              </Box>

              <Box display={"block"} width={"600px"} className="container-mesas-esquerda" marginLeft={"50px"}>
                <Flex justifyContent={"end"} minH={"90px"} marginRight={"-150px"} marginBottom={"80px"} marginTop={"-20px"}>
                  <Box 
                  bg={
                    tablesAvailability["22"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["22"]?.availability?.Tarde === "Livre"
                      ? "url('/img/varanda_livre.png')"
                      : "url('/img/varanda_ocupada.png')"
                  }
                  backgroundSize={"cover"}
                  border={"1px solid #000"} 
                  width={"380px"}
                  onClick={() =>
                    handleClickTable(
                      tablesAvailability["22"]?.table_id,
                      tablesAvailability["22"]?.table_type,
                      tablesAvailability["22"]?.availability?.Manha ===
                        "Livre" &&
                        tablesAvailability["22"]?.availability?.Tarde ===
                          "Livre"
                        ? false
                        : true
                    )
                  }
                  cursor={
                    tablesAvailability["22"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["22"]?.availability?.Tarde === "Livre"
                      ? "pointer"
                      : ""
                  }
                >
                  {tablesAvailability["22"]?.availability?.Manha === "Livre" &&
                  tablesAvailability["22"]?.availability?.Tarde === "Livre"
                    ? "Mesa Livre"
                    : tablesAvailability["22"]?.availability?.Tarde}
                    <Text textAlign={"center"}>Varanda</Text>
                  </Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(3, 1fr)"
                  maxW={"510px"}
                  paddingLeft={"0px"}
                >
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_DP-financ.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    DP/Financ: Adelia{" "}
                    
                  </GridItem>
                  <GridItem
                   className="mesa"
                   minH={"40px"}
                   border={"1px solid #000"}
                   p={5}
                   bg={"url('/img/mesa_DP-financ.png')"}
                   backgroundPosition= "center"
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    DP/Financ: Adelia{" "}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_DP-financ.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    DP/Financ: Adelia{" "}
                    
                  </GridItem>
                </Grid>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(3, 1fr)"
                  maxW={"510px"}
                  marginRight={"0px"}
                >
                  <GridItem
                    bg={
                      tablesAvailability["1"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["1"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_livre.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
                    minH={"40px"}
                    border={"1px solid #000"}
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
                      <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["2"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["2"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_livre.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["2"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["2"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["2"]?.availability?.Tarde}
                      <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["3"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["3"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_livre.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["3"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["3"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["3"]?.availability?.Tarde}
                      <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                  </GridItem>
                </Grid>
              </Box>

              <Box display={"block"} width={"1000px"} className="container-mesas-esquerda">
                <Flex justifyContent={"start"}>
                  <Box 
                   bg={
                    tablesAvailability["22"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["22"]?.availability?.Tarde === "Livre"
                      ? "url('/img/varanda_livre.png')"
                      : "url('/img/varanda_ocupada.png')"
                  }
                  backgroundSize={"cover"}
                  border={"1px solid #000"} 
                  width={"380px"} 
                  minH={"90px"} 
                  marginLeft={"150px"} 
                  marginTop={"-20px"} 
                  marginBottom={"80px"}
                  >
                    <Text textAlign={"center"}>Varanda</Text>
                  </Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(5, 1fr)"
                  maxW={"680px"}
                  marginLeft={"300px"}
                >
                  <GridItem></GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["4"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["4"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_DA_livre_1.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["4"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["5"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["5"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                  }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["5"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["5"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
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
                      ? "url('/img/mesa_DA_livre_2.png')"
                      : "url('/img/mesa_ocupada.png')"
                  }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["6"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["6"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["6"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["7"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["7"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                  }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["7"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["7"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["7"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["7"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["7"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(5, 1fr)"
                  maxW={"680px"}
                  marginLeft={"300px"}
                >
                  <GridItem></GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["8"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["8"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_DA_livre_3.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["8"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["8"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["8"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["9"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["9"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["9"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["9"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
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
                      ? "url('/img/mesa_DA_livre_4.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={2}
                    cursor={
                      tablesAvailability["10"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["10"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["10"]?.table_name}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["11"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["11"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                  className="mesa"
                  backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={2}
                    cursor={
                      tablesAvailability["11"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["11"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["11"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["11"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["11"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} ml={5} marginTop={"114px"} marginLeft={"0px"} className="container-cima-direita">
                <Flex justifyContent={"end"} minH={"36px"}>
                  <Box></Box>
                </Flex>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(4, 1fr)"
                >
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_socio_victor.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    Victor{" "}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["12"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["12"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["12"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["12"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["12"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["12"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["12"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_socio_patty.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    Patty{" "}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_socio_ellen.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
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
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"  
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["13"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["13"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
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
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["14"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["14"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
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
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["15"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["15"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
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
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa"
                    backgroundPosition= "center"
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
                    border={"1px solid #000"}
                    p={5}
                    cursor={
                      tablesAvailability["16"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["16"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img className="cadeira" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["16"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["16"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["16"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
            </Flex>
            <Flex width={"2900px"} overflow={"visible"} marginTop={"-150px"} marginLeft={"100px"} className="container-baixo">
            <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(4, 1fr)"
                  minW={"500px"}
                  mt={"-10px"}
                >
                  <GridItem 
                  colSpan={2} 
                  border={"1px solid #000"} 
                  borderLeft={"4px"} 
                  marginLeft={"-3px"} 
                  minW={"200px"} 
                  maxH={"110px"}
                  bg={"url('/img/banheiro_canto_esquerdo.png')"}
                  backgroundSize={'230px 110px'}
                  backgroundRepeat={'no-repeat'}
                  >
                    Banheiro
                  </GridItem>
                  <GridItem 
                  colSpan={2} 
                  border={"0px solid #000"} 
                  marginLeft={"0px"} 
                  w={"270px"} 
                  maxH={"130px"}
                  bg={"url('/img/cozinha.png')"}
                  backgroundSize={'240px 107px'}
                  backgroundRepeat={'no-repeat'}
                  >
                    Copa
                  </GridItem>
                </Grid>
              <Box display={"block"} minW={"40px"}>
              </Box>

              <Box display={"block"} minW={"200px"} marginLeft={"-50px"} mt={5}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem borderRight={"1px"} minH={"80px"} maxW={"100px"}>
                    ENTRADA{" "}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} width={"100%"} mt={"-100px"} ml={"400px"}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(6, 1fr)"
                  marginLeft={"-10px"}
                  width={"240px"}
                >
                  <GridItem 
                  border={"1px solid #000"} 
                  p={5} 
                  minW={"140px"} 
                  minH={"200px"}
                  bg={"url('/img/banheiro_centro.png')"}
                  backgroundSize={'140px 195px'}
                  backgroundRepeat={'no-repeat'}
                  >
                    Banheiro
                  </GridItem>
                  <GridItem 
                  border={"1px solid #000"} 
                  p={5} 
                  minW={"140px"} 
                  minH={"200px"}
                  bg={"url('/img/banheiro_centro.png')"}
                  backgroundSize={'140px 195px'}
                  backgroundRepeat={'no-repeat'}
                  transform={'scaleX(-1)'}
                  >
                    Banheiro
                  </GridItem>
                  <GridItem
                    border={"1px solid #000"}
                    borderBottom={"1px solid"}
                    p={5}
                    className="mesa"
                    mt="108px"
                    bg={"url('/img/mesa_maquina.png')"}
                    backgroundPosition= "center"
                  >
                   <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    Máquina BI
                  </GridItem>
                  <GridItem 
                  className="mesa"
                  border={"1px solid #000"}
                  mt="108px"
                  p={5}
                  bg={"url('/img/mesa_rotativo.png')"}
                  backgroundPosition= "center"
                  >
                  <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    Rotativo
                  </GridItem>
                  <GridItem 
                  className="mesa"
                  border={"1px solid #000"}
                  mt="108px"
                  p={5}
                  bg={"url('/img/mesa_rotativo.png')"}
                  backgroundPosition= "center"
                  >
                  <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    Rotativo
                  </GridItem>
                  <GridItem 
                  className="mesa"
                  border={"1px solid #000"}
                  mt="108px"
                  p={5}
                  bg={"url('/img/mesa_rotativo.png')"}
                  backgroundPosition= "center"
                  >
                  <img className="cadeira-padrao" src="/img/mesa_com_sombra.png"></img>
                    Rotativo
                  </GridItem>
                </Grid>
              </Box>

              <Box display={"block"} mt={5} ml={5}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(2, 1fr)"
                  height={"255px"}
                  marginRight={"140px"}
                  marginTop={"-60px"}
                  className="container-baixo-direita"
                >
                  <GridItem
                    bg={
                      tablesAvailability["17"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["17"]?.availability?.Tarde === "Livre"
                      ? "url('/img/mesa_livre.png')"
                      : "url('/img/mesa_ocupada.png')"
                    }
                    className="mesa-vertical"
                    backgroundPosition= "center"
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
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                  >
                    <img className="cadeira-vertical-oposta" src="/img/mesa_com_sombra.png"></img>
                    {tablesAvailability["17"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["17"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : tablesAvailability["17"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                    className="mesa-vertical"
                    marginLeft={"-80px"}
                    bg={"url('/img/mesa_socio_brunno.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-vertical" src="/img/mesa_com_sombra.png"></img>
                    Brunno{" "}
                  </GridItem>
                  <GridItem
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                    className="mesa-vertical"
                    bg={"url('/img/mesa_socio_thais.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-vertical-oposta" src="/img/mesa_com_sombra.png"></img>
                    Thais{" "}
                  </GridItem>

                  <GridItem
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                    className="mesa-vertical"
                    marginLeft={"-80px"}
                    bg={"url('/img/mesa_socio_ton.png')"}
                    backgroundPosition= "center"
                  >
                    <img className="cadeira-vertical" src="/img/mesa_com_sombra.png"></img>
                    Ton{" "}
                  </GridItem>
                </Grid>
              </Box>
              <Box display={"block"} mt={5}>
                <Grid
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                  marginRight={"160px"}
                  marginTop={"50px"}
                  height={"200px"}
                  width={"100px"}
                >
                  <GridItem minW={"100px"} />
                  <GridItem
                    border={"1px solid #000"}
                    p={5}
                    H={"120px"}
                    w={"230px"}
                    mt={"-35px"}
                    mr={"-115px"}
                    mb={"15px"}
                    bg={"url('/img/banheiro_canto_direito.png')"}
                    backgroundSize={'225px 120px'}
                    backgroundRepeat={'no-repeat'}
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
                     bg={
                    tablesAvailability["22"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["22"]?.availability?.Tarde === "Livre"
                      ? "url('/img/varanda_livre.png')"
                      : "url('/img/varanda_ocupada.png')"
                  }
                  backgroundSize={"cover"}
                    cursor={"pointer"}
                    className="container-varanda-direita"
                    rowSpan={2}
                    colSpan={1}
                    border={"1px solid #000"}
                    minW={"100px"}
                    minH={"400px"}
                    marginTop={"-200px"}
                    marginLeft={"-8"}
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
