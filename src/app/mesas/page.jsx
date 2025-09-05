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
  Select,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  IconButton,
  Image,
  Center,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  format,
  setDate,
  addDays,
  startOfWeek,
  isWeekend,
  parseISO,
  isValid,
} from "date-fns";
import "./home.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import withAuth from "../components/AuthComponent/withAuth";
import { ptBR } from "date-fns/locale";
import { isToday } from "date-fns";

import { ArrowBackIcon, CalendarIcon } from "@chakra-ui/icons";
import NavBar from "../components/navBar";
import { relative } from "path";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

const HomePage = () => {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const scrollPos = useRef({ left: 0, top: 0 });
  const [selectedDate, setSelectedDate] = useState(null);
  const router = useRouter();

  const [startDate, setStartDate] = useState();
  const [tablesAvailability, setTablesAvailability] = useState([]);
  const [tableID, setTableID] = useState();
  const [tableType, setTableType] = useState();
  const [weekOffset, setWeekOffset] = useState(0);
  const [periodReserve, setPeriodReserve] = useState("");
  const [tableReserved, setTableReserved] = useState([]);
  const [reserveDate, setReserveDate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomsAvailability, setRoomsAvailability] = useState([]);
  const [conferenceRoomID, setConferenceRoomID] = useState();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomsReserved, setRoomsReserved] = useState([]);
  const [isModalOneOpen, setModalOneOpen] = useState(false);
  const [availableStartHours, setAvailableStartHours] = useState([]);
  const [availableEndHours, setAvailableEndHours] = useState([]);
  const [reservedHours, setReservedHours] = useState([]);
  const [dateReserve, setDateReserve] = useState(null);
  const [filteredStartHours, setFilteredStartHours] = useState([]);
  const [filteredEndHours, setFilteredEndHours] = useState([]);
  const [defaultEndHours, setDefaultEndHours] = useState([]);
  const [defaultStartHours, setDefaultStartHours] = useState([]);
  const [authUserId, setAuthUserId] = useState([]);
  const [reservationDeleted, setReservationDeleted] = useState(false);
  const [userLogged, setUserLogged] = useState();
  const [reservationDeletedTable, setReservationDeletedTable] = useState(false);
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const openModalOne = () => setModalOneOpen(true);

  const handleModalClose = () => {
    // Redefine os valores dos selects ao fechar o modal
    setStartTime("");
    setEndTime(""); // Reseta o horário de término
    setFilteredStartHours([]); // Reseta as listas filtradas
    setFilteredEndHours([]);
    setModalOneOpen(false); // Chama a função onClose para fechar o modal
  };

    const handleMouseDown = (e) => {
    // Ignora drag se clicou numa sala/mesa
    if (e.target.closest(".mesa") || e.target.closest(".sala")) return;

    isDragging.current = true;
    setIsDraggingUI(true);
    document.body.style.userSelect = "none"; // desativa seleção
    startPos.current = { x: e.pageX, y: e.pageY };
    scrollPos.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dx = e.pageX - startPos.current.x;
    const dy = e.pageY - startPos.current.y;
    scrollRef.current.scrollLeft = scrollPos.current.left - dx;
    scrollRef.current.scrollTop = scrollPos.current.top - dy;
  };

  const stopDragging = () => {
    isDragging.current = false;
    setIsDraggingUI(false);
    document.body.style.userSelect = ""; // restaura seleção
  };

    const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const toast = useToast();

  const handleClickTable = async (tableID, tableType) => {
    if (tableID == 18 || tableID == 19 || tableID == 20) {
      setTableID(tableID);
      setTableType(tableType);
      await getReservationTable(tableID, startDate);
      onOpen();
    // } else if (tableID == 4 || tableID == 6 || tableID == 8 || tableID == 10) {
    //   if (userLogged.role_id == 3) {
    //     setTableID(tableID);
    //     setTableType(tableType);
    //     await getReservationTable(tableID, startDate);
    //     onOpen();
    //   } else {
    //     alert("Você não tem permissão para efetuar essa reserva");
    //   }
    } else {
      setTableID(tableID);
      setTableType(tableType);
      await getReservationTable(tableID, startDate);
      onOpen();
    }
  };

  const filterRooms = async (id) => {
    // Redefine os estados de horários disponíveis
    setFilteredStartHours([]);
    setFilteredEndHours([]);
    setReservedHours([]);

    let date = startDate;

    // agora pega os dados direto da função
    const reserved = await reservesRoom(id, date);
    const available = await availableSlots();

    setConferenceRoomID(id);

    // Filtra com os dados corretos
    const { filteredStartHours, filteredEndHours } = filterAvailableTimes(
      reserved,
      available.startSlots,
      available.endSlots,
      date
    );
    setDefaultEndHours(filteredEndHours);
    setDefaultStartHours(filteredStartHours);

    setFilteredStartHours(filteredStartHours);
    setFilteredEndHours(filteredEndHours);
  };

  const handleClickRoom = async (id) => {
    try {
      setStartTime("");
      setEndTime("");
      setDateReserve(startDate);
      let data = startDate;
      await getReservationRoom(id, data);
      await filterRooms(id);
    } catch (error) {
      console.error("Erro ao processar a reserva:", error);
    }
  };

  useEffect(() => {
    if (filteredStartHours.length > 0 || filteredEndHours.length > 0) {
      openModalOne();
    }
  }, [filteredStartHours, filteredEndHours]);

  const deleteReservation = async (reservationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}room/delete/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Passa o token do usuário logado
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Reserva cancelada com sucesso");
        setReservationDeleted(true);
        getInfoRooms(startDate);
        getInfoDate(startDate);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Erro ao cancelar a reserva:", error);
    }
  };

  const deleteReservationTable = async (reservationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}table/delete/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Passa o token do usuário logado
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Reserva cancelada com sucesso");
        setReservationDeletedTable(true);
        getInfoRooms(startDate);
        getInfoDate(startDate);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Erro ao cancelar a reserva:", error);
    }
  };

  const getReservationRoom = async (id, date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}room/${id}/${formattedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setRoomsReserved(data.occupied_slots);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const getReservationTable = async (id, date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}table/${id}/${formattedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setTableReserved(data.occupied_slots);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const handleDateChange = async (date) => {
    setStartDate(date);
    setDateReserve(date);
    await getInfoDate(date);
    await getInfoRooms(date);

    // Recalcula os horários disponíveis após a data ser alterada
    if (conferenceRoomID) {
      await reservesRoom(conferenceRoomID, date);
      const now = new Date();
      const currentTime = `${now.getHours()}:${now.getMinutes()}`;
      const { filteredStartHours, filteredEndHours } = filterAvailableTimes(
        reservedHours,
        availableStartHours,
        availableEndHours,
        currentTime
      );
      setAvailableStartHours(filteredStartHours);
      setAvailableEndHours(filteredEndHours);
    }
  };

  const availableSlots = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}availableSlots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      const { available_start_slots, available_end_slots } = data;

      // atualiza os estados
      setAvailableStartHours(available_start_slots);
      setAvailableEndHours(available_end_slots);

      // mas também retorna os dados
      return {
        startSlots: available_start_slots || [],
        endSlots: available_end_slots || [],
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { startSlots: [], endSlots: [] };
    }
  };

  const reservesRoom = async (id, date) => {
    if (!date) return [];

    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}room/${id}/${formattedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
      const data = await res.json();

      // atualiza o estado (como antes)
      setReservedHours(data.occupied_slots);

      // mas também retorna os dados
      return data.occupied_slots || [];
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
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

  const getInfoRooms = async (date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}room/${formattedDate}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setRoomsAvailability(data.items?.conferenceRooms);
          setDateReserve(data.items.date);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const reservationTable = async () => {
    if (tableType == 1 || tableType == 2) {
      setPeriodReserve("dia_todo");
    }
    console.log(startDate, reserveDate);
    const data = {
      table_id: tableID,
      date: startDate,
      period: periodReserve,
    };
    console.log(data);
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
      setStartDate(startDate);
      getInfoDate(startDate);
      getInfoRooms(startDate);
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
    const data = {
      conference_room_id: conferenceRoomID,
      date: startDate,
      startTime: startTime,
      endTime: endTime,
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
      handleModalClose();
      setStartDate(startDate);
      getInfoRooms(startDate);
      getInfoDate(startDate);
    } else {
      toast({
        title: "Erro ao reservar",
        description: responseData.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setStartTime("");
    setEndTime("");
  };

  const getUserLogged = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}user`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserLogged(data);
        setAuthUserId(data.id); // Armazene o ID do usuário no estado, se necessário
      })
      .catch((error) => {
        console.error("Erro ao buscar o usuário logado:", error);
      });
  };

  const filterAvailableTimes = (
    reservedHours,
    availableStartHours,
    availableEndHours,
    selectedDate
  ) => {
    const now = new Date(); // Data e hora atual
    const currentHour = `${now.getHours()}:${now.getMinutes()}`.padStart(
      5,
      "0"
    ); // Horário atual para comparação

    // Verifica se 'selectedDate' é um objeto de data válido, se não for, cria um.
    if (!(selectedDate instanceof Date)) {
      selectedDate = new Date(selectedDate); // Converte a 'selectedDate' para um objeto Date, se necessário.
    }

    // Converte as datas para um formato comparável
    const today = new Date().toLocaleDateString(); // Data de hoje no formato local
    const selectedDay = selectedDate.toLocaleDateString(); // Data selecionada no formato local

    // Filtra horários com base nas reservas
    reservedHours.forEach((reservation) => {
      const startHour = reservation.start_time.split(":").slice(0, 2).join(":");
      const endHour = reservation.end_time.split(":").slice(0, 2).join(":");

      // Remove horários de início que estão dentro do intervalo de reserva
      availableStartHours = availableStartHours.filter(
        (hour) => hour < startHour || hour >= endHour
      );

      // Remove horários de fim que estão dentro do intervalo de reserva
      availableEndHours = availableEndHours.filter(
        (hour) => hour <= startHour || hour > endHour
      );
    });

    // Se a data selecionada for hoje, filtra os horários disponíveis com base na hora atual
    if (today === selectedDay) {
      availableStartHours = availableStartHours.filter(
        (hour) => hour >= currentHour
      );
      availableEndHours = availableEndHours.filter(
        (hour) => hour > currentHour
      );
    }

    return {
      filteredStartHours: availableStartHours,
      filteredEndHours: availableEndHours,
    };
  };

  const handleStartTimeChange = (selectedStartTime) => {
    let endHours = [];

    reservedHours.forEach((reservation, index) => {
      if (!selectedStartTime) {
        // Verifica se o placeholder foi selecionado
        setFilteredEndHours(defaultEndHours); // Restaura a lista completa de horários de fim
        setStartTime(null); // Reseta o estado do horário de início
        return;
      }
      const reservationStart = reservation.start_time
        .split(":")
        .slice(0, 2)
        .join(":");
      const reservationEnd = reservation.end_time
        .split(":")
        .slice(0, 2)
        .join(":");

      if (selectedStartTime < reservationStart) {
        endHours = defaultEndHours.filter(
          (hour) => hour > selectedStartTime && hour <= reservationStart
        );
      } else if (selectedStartTime === reservationEnd) {
        // Se o horário de início for exatamente igual ao fim de uma reserva, exiba horários após essa reserva
        const nextReservation = reservedHours[index + 1];
        if (nextReservation) {
          const nextReservationStart = nextReservation.start_time
            .split(":")
            .slice(0, 2)
            .join(":");
          endHours = defaultEndHours.filter(
            (hour) => hour > selectedStartTime && hour <= nextReservationStart
          );
        } else {
          // Se não houver próxima reserva, permita qualquer horário após o fim da reserva atual
          endHours = defaultEndHours.filter((hour) => hour > selectedStartTime);
        }
      } else if (
        selectedStartTime > reservationEnd &&
        selectedStartTime < reservationStart
      ) {
        endHours = defaultEndHours.filter(
          (hour) => hour > selectedStartTime && hour <= reservationStart
        );
      }
    });

    // Se não houver reservas subsequentes, permita qualquer horário após o selecionado
    if (endHours.length === 0) {
      endHours = defaultEndHours.filter((hour) => hour > selectedStartTime);
    }

    setFilteredEndHours(endHours);
    setStartTime(selectedStartTime);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      toast({
        title: "Logout efetuado com sucesso",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  const handleEndTimeChange = (selectedEndTime) => {
    let startHours = [];

    reservedHours.forEach((reservation, index) => {
      if (!selectedEndTime) {
        // Verifica se o placeholder foi selecionado
        setFilteredStartHours(defaultStartHours); // Restaura a lista completa de horários de fim
        console.log("filtro após o place: ", filteredStartHours);
        setEndTime(null); // Reseta o estado do horário de início
        return;
      }
      const reservationStart = reservation.start_time
        .split(":")
        .slice(0, 2)
        .join(":");
      const reservationEnd = reservation.end_time
        .split(":")
        .slice(0, 2)
        .join(":");

      if (selectedEndTime < reservationEnd) {
        startHours = defaultStartHours.filter(
          (hour) => hour < selectedEndTime && hour <= reservationEnd
        );
      } else if (selectedEndTime === reservationStart) {
        // Se o horário de início for exatamente igual ao fim de uma reserva, exiba horários após essa reserva
        const nextReservation = reservedHours[index + 1];
        if (nextReservation) {
          const nextReservationEnd = nextReservation.end_time
            .split(":")
            .slice(0, 2)
            .join(":");
          startHours = defaultStartHours.filter(
            (hour) => hour < selectedEndTime && hour <= nextReservationEnd
          );
        } else {
          // Se não houver próxima reserva, permita qualquer horário após o fim da reserva atual
          startHours = defaultStartHours.filter(
            (hour) => hour < selectedEndTime
          );
        }
      } else if (
        selectedEndTime > reservationStart &&
        selectedEndTime < reservationEnd
      ) {
        startHours = defaultStartHours.filter(
          (hour) => hour < selectedEndTime && hour <= reservationEnd
        );
      }
    });

    // Se não houver reservas subsequentes, permita qualquer horário após o selecionado
    if (startHours.length === 0) {
      startHours = defaultStartHours.filter((hour) => hour < selectedEndTime);
    }

    setFilteredStartHours(startHours);
    setEndTime(selectedEndTime);
  };

  const gridTemplateColumns = useBreakpointValue({
    base: "repeat(2, 1fr)",
    md: "repeat(5, 1fr)",
  });
  const buttonWidth = useBreakpointValue({ base: "100%", md: "50%" });

  // Função para obter os próximos 5 dias úteis (de segunda a sexta)
  const getWeekDays = (offset) => {
    let days = [];
    let monday = startOfWeek(new Date(), { weekStartsOn: 1 }); // Pega a segunda-feira da semana
    let date = addDays(monday, offset * 7); // Move para a semana correta

    while (days.length < 5) {
      if (!isWeekend(date)) {
        days.push(new Date(date)); // Clona a data para evitar referências
      }
      date = addDays(date, 1); // Avança um dia
    }

    return days;
  };

  const weekDays = getWeekDays(weekOffset);

  useEffect(() => {
      setSelectedDate(
        weekDays.find(
          (day) => day.toDateString() === new Date().toDateString()
        ) || weekDays[0]
      );
    }, [weekOffset]);

  // useEffect(() => {
  //   availableStartHours, availableEndHours, reservedHours

  //   const { filteredStartHours, filteredEndHours } = filterAvailableTimes(reservedHours, availableStartHours, availableEndHours);
  // }, []);

  useEffect(() => {
    if (reservationDeleted) {
      // Reabra o modal e chame handleClickRoom para atualizar as listas
      handleClickRoom(conferenceRoomID);

      // Certifique-se de resetar o estado para evitar loops
      setReservationDeleted(false);
    }
  }, [reservationDeleted, conferenceRoomID]);

  useEffect(() => {
    if (reservationDeletedTable) {
      // Reabra o modal e chame handleClickRoom para atualizar as listas
      handleClickTable(tableID, tableType);

      // Certifique-se de resetar o estado para evitar loops
      setReservationDeletedTable(false);
    }
  }, [reservationDeletedTable, tableID, tableType]);

  useEffect(() => {
    if (!startDate) {
      handleDateChange(new Date());
    } else {
      handleDateChange(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    handleClickRoom(conferenceRoomID);
  }, [conferenceRoomID]);

  useEffect(() => {}, [filteredStartHours, filteredEndHours]);

  useEffect(() => {
    getUserLogged();
  }, []);
  return (
    <>
      <Flex justify="space-between" align="center" mt={5} mb={4} px={4}>
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Voltar"
          onClick={() => router.back()} // Voltar para a página anterior
          colorScheme="gray"
        />
        <Button colorScheme="gray" onClick={handleLogout}>
          Sair
        </Button>
      </Flex>
      <Flex justifyContent={"center"} py={12} px={6} wrap={"wrap"}>
        <Stack>
          <Box textAlign="center">
            {/* Controles de navegação */}
            <Center>
              <Flex justify="space-between" width={buttonWidth} gap={10} mb={4}>
                <Button onClick={() => setWeekOffset(weekOffset - 1)}>
                  Semana Anterior
                </Button>
                <Image
                  src="/img/logo_newton_2.png"
                  alt="Logo Newton"
                  width="20%"
                  height={"100%"}
                  mt={-8}
                />
                <Button onClick={() => setWeekOffset(weekOffset + 1)}>
                  Próxima Semana
                </Button>
              </Flex>
            </Center>
  
            {/* Dias da semana */}
            <Center>
              <Grid
                templateColumns={gridTemplateColumns}
                gap={2}
                mt={10}
                width={"70%"}
              >
                {weekDays.map((day, index) => (
                  <VStack key={index}>
                    <Text fontSize="md" fontWeight="bold">
                      {format(day, "EEEE", { locale: ptBR })}
                    </Text>
                    <Button
                      onClick={() => setStartDate(day)}
                      colorScheme={
                        startDate?.toDateString() === day.toDateString()
                          ? "blue"
                          : isToday(day)
                          ? "green"
                          : "gray"
                      }
                      width="100%"
                    >
                      {format(day, "dd/MM/yyyy")}
                    </Button>
                  </VStack>
                ))}
              </Grid>
            </Center>
  
            {/* Exibir data selecionada */}
            {startDate && (
              <Text mt={4} mb={10}>
                Dia selecionado:{" "}
                {format(startDate, "dd 'de' MMMM", { locale: ptBR })}
              </Text>
            )}
          </Box>
        </Stack>
      </Flex>
      {/* Botão Esquerda */}
      <Button
        position="absolute"
        top="70%"
        left="30px"
        transform="translateY(-50%)"
        zIndex={10}
        onClick={scrollLeft}
        colorScheme="blue"
      >
        ◀
      </Button>

      {/* Botão Direita */}
      <Button
        position="absolute"
        top="70%"
        right="30px"
        transform="translateY(-50%)"
        zIndex={10}
        onClick={scrollRight}
        colorScheme="blue"
      >
        ▶
      </Button>
      {tablesAvailability && (
        <Flex
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        overflow="auto"
        cursor={isDraggingUI ? "grabbing" : "grab"}
        w="100%"
        h="100vh">
          <Box
            py={12}
            px={6}
            height={"1000px"}
            boxShadow={"lg"}
            marginLeft={"-38px"}
            className={"container"}
          >
            <Flex
              width={"2830px"}
              height={"780px"}
              marginTop={"63px"}
              paddingTop={"20px"}
              overflowY={"auto"}
              overflowX={"auto"}
            >
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
                      roomsAvailability["2"]?.status === "Livre"
                        ? "url('/img/varanda_livre.png')"
                        : "url('/img/varanda_ocupada.png')"
                    }
                    backgroundSize={"cover"}
                    className="vertical-text"
                    rowSpan={2}
                    colSpan={1}
                    border={"1px solid #000"}
                    minW={"90px"}
                    minH={"380px"}
                    borderLeft={"3px solid"}
                    onClick={() =>
                      handleClickRoom(
                        roomsAvailability["2"]?.id,
                        roomsAvailability["2"]?.status === "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      roomsAvailability["2"]?.availability?.status === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {roomsAvailability["2"]?.status === "Livre"
                      ? "Varanda Livre"
                      : roomsAvailability["2"]?.status}
                  </GridItem>
                </Grid>
              </Box>
              <Box
                display={"block"}
                width={"500px"}
                maxH={"100px"}
                marginTop={"20px"}
                paddingRight={"50px"}
              >
                <Flex justifyContent={"end"} minH={"36px"}>
                  <Box></Box>
                </Flex>
                <Grid
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                  marginTop={"13px"}
                >
                  <GridItem
                    bg={
                      roomsAvailability["1"]?.status === "Livre"
                        ? "url('/img/sala_reuniao_livre.png')"
                        : "url('/img/sala_reuniao_ocupada.png')"
                    }
                    backgroundSize={"cover"}
                    colSpan={2}
                    minH={"75px"}
                    border={"1px solid #000"}
                    height={"300px"}
                    width={"550px"}
                    p={5}
                    borderTop={"4px solid"}
                    borderLeft={"4px solid"}
                    marginTop={"1px"}
                    marginLeft={""}
                    onClick={() =>
                      handleClickRoom(
                        roomsAvailability["1"]?.id,
                        roomsAvailability["1"]?.status === "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      roomsAvailability["1"]?.status === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {roomsAvailability["1"]?.status === "Livre"
                      ? ""
                      : roomsAvailability["1"]?.status}{" "}
                  </GridItem>
                </Grid>
              </Box>

              <Box
                display={"block"}
                width={"600px"}
                className="container-mesas-esquerda"
                marginLeft={"50px"}
              >
                <Flex
                  justifyContent={"end"}
                  minH={"90px"}
                  marginRight={"-150px"}
                  marginBottom={"80px"}
                  marginTop={"-20px"}
                >
                  <Box
                    bg={
                      roomsAvailability["3"]?.status === "Livre"
                        ? "url('/img/varanda_livre.png')"
                        : "url('/img/varanda_ocupada.png')"
                    }
                    backgroundSize={"cover"}
                    border={"1px solid #000"}
                    width={"380px"}
                    onClick={() =>
                      handleClickRoom(
                        roomsAvailability["3"]?.id,
                        roomsAvailability["3"]?.status === "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      roomsAvailability["3"]?.status === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {roomsAvailability["3"]?.status === "Livre"
                      ? ""
                      : roomsAvailability["3"]?.status}
                    <Text textAlign={"center"}></Text>
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
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_DP-financ.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_DP-financ.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
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
                    backgroundPosition="center"
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
                      ? ""
                      : tablesAvailability["1"]?.availability?.Tarde}
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                      ? ""
                      : tablesAvailability["2"]?.availability?.Tarde}
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                      ? ""
                      : tablesAvailability["3"]?.availability?.Tarde}
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                  </GridItem>
                </Grid>
              </Box>

              <Box
                display={"block"}
                width={"1000px"}
                className="container-mesas-esquerda"
              >
                <Flex justifyContent={"start"}>
                  <Box
                    bg={
                      roomsAvailability["4"]?.status === "Livre"
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
                    onClick={() =>
                      handleClickRoom(
                        roomsAvailability["4"]?.id,
                        roomsAvailability["4"]?.status === "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      roomsAvailability["4"]?.status === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {roomsAvailability["4"]?.status === "Livre"
                      ? ""
                      : roomsAvailability["4"]?.status}
                    <Text textAlign={"center"}></Text>
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["5"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["5"]?.availability?.Tarde === "Livre"
                      ? ""
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["7"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["7"]?.availability?.Tarde === "Livre"
                      ? ""
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["9"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["9"]?.availability?.Tarde === "Livre"
                      ? ""
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["11"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["11"]?.availability?.Tarde === "Livre"
                      ? ""
                      : tablesAvailability["11"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
              <Box
                display={"block"}
                ml={5}
                marginTop={"114px"}
                marginLeft={"0px"}
                className="container-cima-direita"
              >
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
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["12"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["12"]?.availability?.Tarde === "Livre"
                      ? ""
                      : tablesAvailability["12"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_socio_patty.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
                  </GridItem>
                  <GridItem
                    className="mesa"
                    minH={"40px"}
                    border={"1px solid #000"}
                    p={5}
                    bg={"url('/img/mesa_socio_ellen.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["13"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["13"]?.availability?.Tarde === "Livre"
                      ? ""
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["14"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["14"]?.availability?.Tarde === "Livre"
                      ? ""
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["15"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["15"]?.availability?.Tarde === "Livre"
                      ? ""
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["16"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["16"]?.availability?.Tarde === "Livre"
                      ? ""
                      : tablesAvailability["16"]?.availability?.Tarde}
                  </GridItem>
                </Grid>
              </Box>
            </Flex>
            <Flex
              width={"2900px"}
              overflow={"visible"}
              marginTop={"-150px"}
              marginLeft={"100px"}
              className="container-baixo"
            >
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
                  backgroundSize={"230px 110px"}
                  backgroundRepeat={"no-repeat"}
                ></GridItem>
                <GridItem
                  colSpan={2}
                  border={"0px solid #000"}
                  marginLeft={"0px"}
                  w={"270px"}
                  maxH={"130px"}
                  bg={"url('/img/cozinha.png')"}
                  backgroundSize={"240px 107px"}
                  backgroundRepeat={"no-repeat"}
                ></GridItem>
              </Grid>
              <Box display={"block"} minW={"40px"}></Box>

              <Box display={"block"} minW={"200px"} marginLeft={"-50px"} mt={5}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem borderRight={"1px"} minH={"80px"} maxW={"100px"}>
                    {" "}
                  </GridItem>
                  
                  <img className="entrada" src="/img/entrada.png"></img>
                  <img className="movel" src="/img/movel.png"></img>
                  <p className="entrada-text">ENTRADA</p>
                </Grid>
              </Box>
              <Box display={"block"} width={"100%"} mt={"-100px"} ml={"400px"}>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(6, 1fr)"
                  marginLeft={"-10px"}
                  width={"240px"}
                >
                  <img className="moveis" src="/img/moveis.png"></img>

                  <GridItem
                    border={"1px solid #000"}
                    p={5}
                    minW={"140px"}
                    minH={"200px"}
                    bg={"url('/img/banheiro_centro.png')"}
                    backgroundSize={"140px 195px"}
                    backgroundRepeat={"no-repeat"}
                    position={"relative"}
                  ></GridItem>
                  <GridItem
                    border={"1px solid #000"}
                    p={5}
                    minW={"140px"}
                    minH={"200px"}
                    bg={"url('/img/banheiro_centro.png')"}
                    backgroundSize={"140px 195px"}
                    backgroundRepeat={"no-repeat"}
                    transform={"scaleX(-1)"}
                  ></GridItem>
                  <GridItem
                    border={"1px solid #000"}
                    borderBottom={"1px solid"}
                    p={5}
                    className="mesa"
                    mt="108px"
                    bg={"url('/img/mesa_maquina.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                  </GridItem>
                  <GridItem
                    className="mesa"
                    border={"1px solid #000"}
                    mt="108px"
                    p={5}
                    bg={
                      tablesAvailability["18"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["18"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_rotativo.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    backgroundPosition="center"
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["18"]?.table_id,
                        tablesAvailability["18"]?.table_type,
                        tablesAvailability["18"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["18"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    cursor={
                      tablesAvailability["18"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["18"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                  </GridItem>
                  <GridItem
                    className="mesa"
                    border={"1px solid #000"}
                    mt="108px"
                    p={5}
                    bg={
                      tablesAvailability["19"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["19"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_rotativo.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    backgroundPosition="center"
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["19"]?.table_id,
                        tablesAvailability["19"]?.table_type,
                        tablesAvailability["19"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["19"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    cursor={
                      tablesAvailability["19"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["19"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                  </GridItem>
                  <GridItem
                    className="mesa"
                    border={"1px solid #000"}
                    mt="108px"
                    p={5}
                    bg={
                      tablesAvailability["20"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["20"]?.availability?.Tarde === "Livre"
                        ? "url('/img/mesa_rotativo.png')"
                        : "url('/img/mesa_ocupada.png')"
                    }
                    backgroundPosition="center"
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["20"]?.table_id,
                        tablesAvailability["20"]?.table_type,
                        tablesAvailability["20"]?.availability?.Manha ===
                          "Livre" &&
                          tablesAvailability["20"]?.availability?.Tarde ===
                            "Livre"
                          ? false
                          : true
                      )
                    }
                    minH={"40px"}
                    cursor={
                      tablesAvailability["20"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["20"]?.availability?.Tarde === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    <img
                      className="cadeira-padrao"
                      src="/img/mesa_com_sombra.png"
                    ></img>
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
                    backgroundPosition="center"
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
                    <img
                      className="cadeira-vertical-oposta"
                      src="/img/mesa_com_sombra.png"
                    ></img>
                    {tablesAvailability["17"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["17"]?.availability?.Tarde === "Livre"
                      ? ""
                      : tablesAvailability["17"]?.availability?.Tarde}
                  </GridItem>
                  <GridItem
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                    className="mesa-vertical"
                    marginLeft={"-80px"}
                    bg={"url('/img/mesa_socio_brunno.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-vertical"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
                  </GridItem>
                  <GridItem
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                    className="mesa-vertical"
                    bg={"url('/img/mesa_socio_thais.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-vertical-oposta"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
                  </GridItem>

                  <GridItem
                    minH={"45px"}
                    border={"1px solid #000"}
                    p={5}
                    className="mesa-vertical"
                    marginLeft={"-80px"}
                    bg={"url('/img/mesa_socio_ton.png')"}
                    backgroundPosition="center"
                  >
                    <img
                      className="cadeira-vertical"
                      src="/img/mesa_com_sombra.png"
                    ></img>{" "}
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
                    backgroundSize={"225px 120px"}
                    backgroundRepeat={"no-repeat"}
                  ></GridItem>
                </Grid>
              </Box>
              <Box>
                <Grid
                  templateRows="repeat(1, 1fr)"
                  templateColumns="repeat(1, 1fr)"
                >
                  <GridItem
                    bg={
                      roomsAvailability["5"]?.status === "Livre"
                        ? "url('/img/varanda_livre.png')"
                        : "url('/img/varanda_ocupada.png')"
                    }
                    backgroundSize={"cover"}
                    className="container-varanda-direita"
                    rowSpan={2}
                    colSpan={1}
                    border={"1px solid #000"}
                    minW={"100px"}
                    minH={"400px"}
                    marginTop={"-200px"}
                    marginLeft={"-8"}
                    onClick={() =>
                      handleClickRoom(
                        roomsAvailability["5"]?.id,
                        roomsAvailability["5"]?.status === "Livre"
                          ? false
                          : true
                      )
                    }
                    cursor={
                      roomsAvailability["5"]?.status === "Livre"
                        ? "pointer"
                        : ""
                    }
                  >
                    {roomsAvailability["5"]?.status === "Livre"
                      ? " Varanda Livre"
                      : roomsAvailability["5"]?.status}{" "}
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
        <ModalContent
          maxW="700px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ModalHeader>Reserva de Mesa</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
          >
            <p>MESA: {tableID}</p>
            <p>Selecione a data para a reserva:</p>
            <DatePicker
              selected={reserveDate != null ? reserveDate : startDate}
              onChange={(date) => setReserveDate(date)}
              dateFormat="dd/MM/yyyy"
              customInput={<Input textAlign={"center"} icon={<CalendarIcon />} />}
            />
            {tableType === 3 && (
              <>
                <p>Selecione o período para a reserva:</p>
                <Select
                  placeholder="Selecione o Horário"
                  size="md"
                  marginTop={"10px"}
                  width={"400px"}
                  onChange={(e) => setPeriodReserve(e.target.value)}
                >
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="dia_todo">Dia todo</option>
                </Select>
              </>
            )}
            {tableReserved && tableReserved.length > 0 ? (
              <TableContainer>
                <h5 style={{ textAlign: "center" }}>Reservas Registradas</h5>
                <Table variant="simple">
                  <TableCaption>Reservas registradas</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Nome do Usuário</Th>
                      <Th>Hora de Início</Th>
                      <Th>Hora de Término</Th>
                      <Th>Ações</Th> {/* Adicionar coluna para ações */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tableReserved.map((element, index) => (
                      <Tr key={index}>
                        <Td>{element.user.name}</Td>
                        <Td>{element.start_time}</Td>
                        <Td>{element.end_time}</Td>
                        <Td>
                          {(authUserId === element.user_id || userLogged.role_id === 1) && ( // Exibir o botão apenas se o user_id corresponder ou ser Adminstrador
                            <Button
                              colorScheme="red"
                              onClick={() => {
                                onClose();
                                deleteReservationTable(element.id); // Executa a função de deletar
                              }}
                            >
                              Deletar
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <p>Nenhuma reserva encontrada.</p>
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

      <Modal isOpen={isModalOneOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent
          maxW="700px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ModalHeader>Reserva de Sala de conferência</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
          >
            <h4>Sala: {conferenceRoomID}</h4>
            <h4>Informe o período para a reserva</h4>
            <Select
              id="start-time"
              placeholder="Selecione a hora de início"
              size="md"
              width={"400px"}
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
            >
              {filteredStartHours.map((hour, index) => (
                <option key={index} value={hour}>
                  {hour}
                </option>
              ))}
            </Select>

            <Select
              id="end-time"
              placeholder="Selecione a hora de término"
              size="md"
              marginTop={"10px"}
              width={"400px"}
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
            >
              {filteredEndHours.map((hour, index) => (
                <option key={index} value={hour}>
                  {hour}
                </option>
              ))}
            </Select>
            {roomsReserved && roomsReserved.length > 0 ? (
              <TableContainer>
                <h5 style={{ textAlign: "center" }}>Reservas Registradas</h5>
                <Table variant="simple">
                  <TableCaption>Reservas registradas</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Nome do Usuário</Th>
                      <Th>Hora de Início</Th>
                      <Th>Hora de Término</Th>
                      <Th>Ações</Th> {/* Adicionar coluna para ações */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {roomsReserved.map((element, index) => (
                      <Tr key={index}>
                        <Td>{element.user.name}</Td>
                        <Td>{element.start_time}</Td>
                        <Td>{element.end_time}</Td>
                        <Td>
                          {(authUserId === element.user_id || userLogged.role_id === 1) && ( // Exibir o botão apenas se o user_id corresponder ou ser Adminstrador
                            <Button
                              colorScheme="red"
                              onClick={() => {
                                handleModalClose();
                                deleteReservation(element.id); // Executa a função de deletar
                              }}
                            >
                              Deletar
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <p>Nenhuma reserva encontrada.</p>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalClose}>
              Fechar
            </Button>
            <Button colorScheme="green" onClick={reservationRoom}>
              Reservar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default withAuth(HomePage);
