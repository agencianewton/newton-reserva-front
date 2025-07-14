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
  Tooltip,
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
  Container,
  Center,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  VStack,
  Icon,
  IconButton,
  useBreakpointValue,
  Image,
} from "@chakra-ui/react";
import "./rooms.css";
import { ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons"; // Certifique-se de importar os ícones corretamente
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  format,
  setDate,
  addDays,
  startOfWeek,
  isWeekend,
  parseISO,
  isValid,
} from "date-fns";
import { addMinutes, startOfDay, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import withAuth from "../components/AuthComponent/withAuth";
import { Calendar, momentLocalizer } from "react-calendar";

import { CalendarIcon } from "@chakra-ui/icons";
import NavBar from "../components/navBar";
import { relative } from "path";
import { isToday } from "date-fns";
import { useRouter } from "next/navigation";
import { parseISOWithOptions } from "date-fns/fp";
import api from "../utils/api";

const RoomsPage = () => {
  const [userLogged, setUserLogged] = useState();
  const [authUserId, setAuthUserId] = useState([]);
  const router = useRouter();

  const [filteredStartHours, setFilteredStartHours] = useState([]);
  const [filteredEndHours, setFilteredEndHours] = useState([]);
  const [defaultEndHours, setDefaultEndHours] = useState([]);
  const [defaultStartHours, setDefaultStartHours] = useState([]);
  const [availableStartHours, setAvailableStartHours] = useState([]);
  const [availableEndHours, setAvailableEndHours] = useState([]);
  const [reservedHours, setReservedHours] = useState([]);

  const gridTemplateColumns = useBreakpointValue({
    base: "repeat(2, 1fr)",
    md: "repeat(5, 1fr)",
  });
  const buttonWidth = useBreakpointValue({ base: "100%", md: "50%" });

  //   const [startTime, setStartTime] = useState("");
  //   const [endTime, setEndTime] = useState("");
  const [roomsReserved, setRoomsReserved] = useState([]);
  const [roomsAvailability, setRoomsAvailability] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [reserveDate, setReserveDate] = useState(null);
  const [periodReserve, setPeriodReserve] = useState("");
  const [date, setDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(date);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [roomName, setRoomName] = useState(null);
  const [endHourRegister, setEndHourRegister] = useState(null);
  const [description, setDescription] = useState("");
  const [recurrentId, setRecurrentId] = useState("1");
  const [recurrentDay, setRecurrentDay] = useState("");
  const [reservationId, setReservationId] = useState();
  const [selectedTimeError, setSelectedTimeError] = useState(false);
  const [selectedTimeEditError, setSelectedTimeEditError] = useState(false);
  const [endTimeError, setEndTimeError] = useState(false);
  const [endTimeEditError, setEndTimeEditError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [descriptionEditError, setDescriptionEditError] = useState(false);
  const [recurrenceError, setRecurrenceError] = useState(false);
  const toast = useToast();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isOpenDetails, setIsOpenDetails] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState({
    id: "",
    userId: "",
    description: "",
    start: "",
    end: "",
    room: "",
    recurrentId: "",
    recurrentDay: "",
    roomId: "",
  });
  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [endTime, setEndTime] = useState("");
  const [onStartTimeChange, setOnStartTimeChange] = useState(() => {});

  const handleOpenDetails = (
    reservationId,
    reservationUserId,
    reservationForTimeSlot,
    reservationStartHour,
    reservationEndHour,
    reservationRoom,
    reservationRecurrentId,
    reservationRecurrentDay,
    roomId,
    slots
  ) => {
    const formattedStart = reservationStartHour.substring(0, 5); // Pega os 5 primeiros caracteres (HH:mm)
    const formattedEnd = reservationEndHour.substring(0, 5);
    setSelectedReservation({
      id: reservationId,
      userId: reservationUserId,
      description: reservationForTimeSlot,
      start: formattedStart,
      end: formattedEnd,
      room: reservationRoom,
      recurrentId: reservationRecurrentId,
      recurrentDay: reservationRecurrentDay,
      roomId: roomId
    });

    if (userLogged.role_id === 1 || userLogged.id === reservationUserId) {
      console.log("verificando se cai na condição: ", selectedReservation);

      // Ajustando a lógica para definir os slots, se necessário
      if (!slots.includes("17:45")) {
        slots.push("15:00");
      } else {
        slots.push("18:00");
      }

      // Encontrando os dados da sala
      const roomData = roomsAvailability.find(
        (r) => r.online_room_id === reservationRoom.roomId
      );

      let takenTimes = [];

      // Verificando as reservas existentes na sala e filtrando os horários
      if (roomData && Array.isArray(roomData.availability)) {
        takenTimes = roomData.availability
          .map((reservation) => {
            const startTime = parseISO(
              `${reserveDate}T${reservation.start_time}`
            );
            const endTime = parseISO(`${reserveDate}T${reservation.end_time}`);
            return isValid(startTime) && isValid(endTime)
              ? { startTime, endTime }
              : null;
          })
          .filter(Boolean)
          .map((reservation) => ({
            startTime: format(reservation.startTime, "HH:mm"),
            endTime: format(reservation.endTime, "HH:mm"),
          }));
      }

      // Criando uma cópia dos slots originais antes de filtrar
      const originalSlots = [...slots];

      // Filtrando as horas de início disponíveis, desconsiderando as ocupadas
      const availableStartTimes = originalSlots.filter((slot) => {
        return !takenTimes.some(
          (res) => slot >= res.startTime && slot < res.endTime
        );
      });

      // Atualizando o estado com as horas de início disponíveis
      setAvailableStartHours(availableStartTimes);

      // Atualizando as horas de fim disponíveis baseado na hora de início selecionada
      setTimeout(() => {
        updateAvailableEndTimes(
          reservationStartHour,
          reservationRoom.roomId,
          slots
        );
      }, 0);

      // Abrindo o modal de atualização
      setIsOpenUpdate(true);
    } else {
      // Caso o usuário não tenha permissão de editar, apenas exibe detalhes
      setIsOpenDetails(true);
    }
  };

  // Função para alterar a hora de início (para edição)
  const handleEditStartTimeChange = (event) => {
    const newStartTime = event.target.value;
    setSelectedReservation({
      ...selectedReservation,
      start: newStartTime,
    });

    // Atualizando as horas de fim disponíveis com base na hora de início selecionada
    updateAvailableEndTimes(newStartTime, selectedReservation.roomId, selectedSlots);
  };

  // Função para alterar a hora de fim (para edição)
  const handleEditEndTimeChange = (event) => {
    const newEndTime = event.target.value;
    setSelectedReservation({
      ...selectedReservation,
      end: newEndTime,
    });
    updateAvailableStartTimes(newEndTime, selectedReservation.roomId, selectedSlots);
  };

  const handleRecurrenceEditChange = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      recurrentId: event.target.value,
    });
    setRecurrentId(event.target.value);
  };
  const handleRecurrenceDayEdit = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      recurrentDay: event.target.value,
    });
    setRecurrentDay(event.target.value);
  };

  // Função para alterar a descrição (para edição)
  const handleEditDescriptionChange = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      description: event.target.value,
    });
  };

  const handleSubmitEdit = async () => {
    // Validação dos dados (hora de início, fim, descrição)
    if (
      !selectedReservation.start ||
      !selectedReservation.end ||
      !selectedReservation.description
    ) {
      setSelectedTimeEditError(!selectedReservation.start);
      setEndTimeEditError(!selectedReservation.end);
      setDescriptionEditError(!selectedReservation.description);
      return;
    }
  
    const data = {
      id: selectedReservation.id,
      online_room_id: selectedReservation.roomId,
      date: reserveDate,
      recurrent_id: selectedReservation.recurrentId,
      recurrent_day: selectedReservation.recurrentDay,
      description: selectedReservation.description,
      start_time: selectedReservation.start,
      end_time: selectedReservation.end,
    };
  
    try {
      const response = await api.put(`reservation/onlineRoom/update/${selectedReservation.id}`, data);
  
      toast({
        title: "Reserva Atualizada com sucesso",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      getInfoOnlineRooms(selectedDate);
      console.log("Reserva atualizada com sucesso:", data);
      handleCloseUpdate();
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.response?.data?.error || "Erro desconhecido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Erro ao atualizar reserva:", error.response?.data || error);
    }
  };  

  const handleCloseUpdate = () => {
    setIsOpenUpdate(false);
  };

  const handleCloseDetails = () => {
    setIsOpenDetails(false);
  };

  const handleStartTimeChange = (event) => {
    const newStartTime = event.target.value;
    setSelectedTime(newStartTime);
    updateAvailableEndTimes(newStartTime, selectedRoomId, selectedSlots); // Passando o novo startTime imediatamente
  };

  const handleEndTimeChange = (event) => {
    const selectedEndTime = event.target.value;
    setEndHourRegister(selectedEndTime);
    setEndTime(selectedEndTime);
  };

  const handleSlotClick = (roomId, roomName, time, slots) => {
    if (!slots.includes("17:45")) {
      slots.push("15:00");
    } else {
      slots.push("18:00");
    }
    setSelectedRoomId(roomId);
    setRoomName(roomName);
    setSelectedTime(time);

    const roomData = roomsAvailability.find((r) => r.online_room_id === roomId);

    let takenTimes = [];

    if (roomData && Array.isArray(roomData.availability)) {
      takenTimes = roomData.availability
        .map((reservation) => {
          const startTime = parseISO(
            `${reserveDate}T${reservation.start_time}`
          );
          const endTime = parseISO(`${reserveDate}T${reservation.end_time}`);
          return isValid(startTime) && isValid(endTime)
            ? { startTime, endTime }
            : null;
        })
        .filter(Boolean)
        .map((reservation) => ({
          startTime: format(reservation.startTime, "HH:mm"),
          endTime: format(reservation.endTime, "HH:mm"),
        }));
    }

    // Criando uma cópia dos slots originais antes de filtrar
    const originalSlots = [...slots];

    const availableStartTimes = originalSlots.filter((slot) => {
      return !takenTimes.some(
        (res) => slot >= res.startTime && slot < res.endTime
      );
    });

    setAvailableStartHours(availableStartTimes);

    // O estado `selectedTime` será atualizado antes de chamar `updateAvailableEndTimes`
    setTimeout(() => {
      updateAvailableEndTimes(time, roomId, slots);
    }, 0);

    setIsModalOpen(true);
  };
  const updateAvailableEndTimes = (startTime, roomId, slots) => {
    if (!startTime) return;

    const roomData = roomsAvailability.find((r) => r.online_room_id === roomId);
    let takenTimes = [];

    if (roomData && Array.isArray(roomData.availability)) {
      takenTimes = roomData.availability
        .map((reservation) => {
          const start = parseISO(`${reserveDate}T${reservation.start_time}`);
          const end = parseISO(`${reserveDate}T${reservation.end_time}`);
          return isValid(start) && isValid(end) ? { start, end } : null;
        })
        .filter(Boolean)
        .map((res) => ({
          startTime: format(res.start, "HH:mm"),
          endTime: format(res.end, "HH:mm"),
        }));
    }

    // Filtra os slots disponíveis após o horário de início selecionado
    const nextReservation = takenTimes
      .filter((t) => t.startTime > startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

    const availableTimes = slots.filter((slot) => {
      const slotTime = format(parseISO(`${reserveDate}T${slot}`), "HH:mm");
      return (
        slotTime > startTime &&
        (!nextReservation || slotTime <= nextReservation.startTime)
      );
    });

    setAvailableEndHours(availableTimes);
  };

  const updateAvailableStartTimes = (endTime, roomId, slots) => {
    if (!endTime || !roomId) return;

    const roomData = roomsAvailability.find((r) => r.online_room_id === roomId);
    let takenTimes = [];

    if (roomData && Array.isArray(roomData.availability)) {
      takenTimes = roomData.availability
        .map((reservation) => {
          const start = parseISO(`${reserveDate}T${reservation.start_time}`);
          const end = parseISO(`${reserveDate}T${reservation.end_time}`);
          return isValid(start) && isValid(end) ? { start, end } : null;
        })
        .filter(Boolean)
        .map((res) => ({
          startTime: format(res.start, "HH:mm"),
          endTime: format(res.end, "HH:mm"),
        }));
    }

    const availableStartTimes = slots.filter((slot) => {
      const slotTime = format(parseISO(`${reserveDate}T${slot}`), "HH:mm");
      return (
        slotTime < endTime &&
        !takenTimes.some((res) => res.startTime === slotTime)
      );
    });

    setAvailableStartHours(availableStartTimes);
  };

  const handleDeleteModal = (reservationId, roomName) => {
    setRoomName(roomName);
    setReservationId(reservationId);
    setIsModalDeleteOpen(true);
  };

  const DeleteModalClose = () => {
    setRoomName();
    setReservationId();

    setIsModalDeleteOpen(false);
  };

  const handleDeleteReservation = async (reservationId) => {
    try {
      const response = await api.delete(`onlineRoom/delete/${reservationId}`);
  
      if (response.data.success) {
        console.log("Reserva deletada com sucesso");
  
        toast({
          title: "Reserva deletada",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
  
        getInfoOnlineRooms(selectedDate);
      } else {
        console.error("Erro ao deletar a reserva:", response.data.error);
        toast({
          title: "Erro ao deletar reserva",
          description: response.data.error || "Erro desconhecido",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Erro ao deletar a reserva:", error);
      toast({
        title: "Erro ao deletar reserva",
        description: error.response?.data?.error || "Erro desconhecido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  
    // Fechando os modais após a requisição
    handleCloseDetails();
    DeleteModalClose();
    handleCloseUpdate();
  };  

  const closeModal = () => {
    setSelectedRoomId(null);
    setSelectedTime(null);
    setAvailableEndTimes([]);
    setEndHourRegister(null);
    setRecurrentDay("");
    setRecurrentId("1");
    setDescription(null);
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    let hasError = false;

    if (!selectedTime || selectedTime.trim() === "") {
      setSelectedTimeError(true);
      hasError = true;
    } else {
      setSelectedTimeError(false);
    }

    if (!endHourRegister || endHourRegister.trim() === "") {
      setEndTimeError(true);
      hasError = true;
    } else {
      setEndTimeError(false);
    }

    if (!description || description.trim() === "") {
      setDescriptionError(true);
      hasError = true;
    } else {
      setDescriptionError(false);
    }

    if (!recurrentId || recurrentId.trim() === "") {
      setRecurrenceError(true);
      hasError = true;
    } else {
      setRecurrenceError(false);
    }

    if (!hasError) {
      handleReservation(); // Chame a função handleReservation sem parâmetros
    }
  };

  const handleReservation = async () => {
    try {
      const data = {
        online_room_id: selectedRoomId,
        date: reserveDate,
        recurrent_id: recurrentId,
        recurrent_day: recurrentDay,
        description: description,
        start_time: selectedTime,
        end_time: endHourRegister,
      };
  
      const res = await api.post("reservation/onlineRoom", data);
  
      toast({
        title: "Reserva realizada com sucesso",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      getInfoOnlineRooms(selectedDate);
      closeModal();
      console.log("reserva efetuada com sucesso: ", data);
    } catch (error) {
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (e.target.value.trim() !== "") {
      setDescriptionError(false);
    }
  };

  const handleLogout = async () => {
    if (userLogged) {
      const token = localStorage.getItem("token");
      const res = await api.post("logout");
      try {
        toast({
          title: "Logout efetuado com sucesso",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.push("/");
      } catch (error) {

      }
    } else {
      router.push("/");
    }
  };

  const handleRecurrenceChange = (event) => {
    setRecurrentId(event.target.value);
  };
  const handleRecurrenceDay = (event) => {
    setRecurrentDay(event.target.value);
  };

  const getUserLogged = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Token não encontrado. Usuário não autenticado.");
        }

        const response = await api.get("/user", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        setUserLogged(response.data);
        setAuthUserId(response.data.id);
    } catch (error) {
        console.error("Erro ao buscar o usuário logado:", error.response?.data || error);
    }
};

  
  
  const getOnlineRooms = async () => {
    try {
      const response = await api.get("get/onlineRooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Erro ao buscar as salas:", error.response?.data || error);
    }
  };
  
  const getInfoOnlineRooms = async (date) => {
    if (!date) return;
  
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await api.get(`onlineRooms/${formattedDate}`);
  
      if (response.data?.onlineRooms) {
        setReserveDate(response.data.date);
        setRoomsAvailability(response.data.onlineRooms);
      } else {
        console.error("Erro: 'onlineRooms' não está na resposta:", response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar informações das salas:", error.response?.data || error);
    }
  };  

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

  // Função para obter os slots de horário
  const getSlots = (date) => {
    let slots = [];
    let startTime = setMinutes(setHours(startOfDay(date), 9), 0);
    let endTime =
      date.getDay() === 5
        ? setMinutes(setHours(startOfDay(date), 15), 0)
        : setMinutes(setHours(startOfDay(date), 18), 0);

    while (startTime < endTime) {
      slots.push(format(startTime, "HH:mm"));
      startTime = addMinutes(startTime, 15); // Adiciona 15 minutos
    }

    return slots;
  };

  useEffect(() => {
    setSelectedDate(
      weekDays.find(
        (day) => day.toDateString() === new Date().toDateString()
      ) || weekDays[0]
    );
  }, [weekOffset]);

  // const refreshToken = async () => {
  //   try {
  //     // Solicitar um novo access_token e refresh_token usando o refresh token
  //     const response = await api.post('/token/refresh', {}, {
  //       withCredentials: true,  // Enviar o refresh token armazenado no cookie
  //     });
  
  //     // Atualizar o localStorage com o novo access_token
  //     localStorage.setItem('access_token', response.data.access_token);
  
  //     // Atualizar o refresh_token no cookie (se necessário)
  //     document.cookie = `refresh_token=${response.data.refresh_token}; path=/; SameSite=Strict;`;
  
  //     // Opcional: Mensagem de sucesso (ou outro tratamento conforme necessário)
  //     console.log('Tokens renovados com sucesso');
      
  //   } catch (error) {
  //     console.error('Erro ao renovar token:', error);
      
  //     // Redireciona para a página de login caso o refresh falhe
  //     window.location.href = "/";  // Redirecionar para login
  //   }
  // };
  

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refreshToken();
  //   }, 1000 * 60 * 50); // Tentar renovar o token a cada 50 minutos

  //   return () => clearInterval(interval); // Limpar o intervalo ao desmontar o componente
  // }, []);

  const selectedSlots = getSlots(selectedDate);

  // const getTokenExpiration = (token) => {
  //   if (!token) return null;
  
  //   const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica a parte do payload do JWT
  //   return payload.exp ? new Date(payload.exp * 1000) : null; // Converte timestamp para data
  // };
  
  // const token = localStorage.getItem("token");
  // const expirationDate = getTokenExpiration(token);
  
  // console.log("Token expira em:", expirationDate);
  

  useEffect(() => {
    getUserLogged();
  }, []);

  useEffect(() => {
    getOnlineRooms();
  }, []);
  useEffect(() => {
    getInfoOnlineRooms(selectedDate);
  }, [selectedDate]); // Só chama a API quando a data mudar

  useEffect(() => {
    if (roomsAvailability.length > 0) {
    }
  }, [roomsAvailability]);

  return (
    <>
      <Container mt={30} maxW={"100%"}>
        <Flex justify="space-between" align="center" mb={4} px={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Voltar"
            onClick={() => router.push("/home")}
            colorScheme="gray"
          />
          <Button colorScheme="gray" onClick={handleLogout}>
            Sair
          </Button>
        </Flex>

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
                    onClick={() => setSelectedDate(day)}
                    colorScheme={
                      selectedDate?.toDateString() === day.toDateString()
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
          {selectedDate && (
            <Text mt={4} mb={10}>
              Dia selecionado:{" "}
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </Text>
          )}
        </Box>

        {/* Tabela de reservas */}
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Reserva de salas</TableCaption>
            <Thead>
              <Tr>
                <Th>Horário</Th>
                {rooms.map((room) => (
                  <Th key={`${room.online_room_id}-${room.name_room}`} textAlign={'center'}>
                    <Tooltip
                      label={
                        <a
                          href={room.link_room}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {room.link_room}
                        </a>
                      }
                      hasArrow
                      placement="top"
                    >
                      <a
                        href={room.link_room}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {room.name_room}
                      </a>
                    </Tooltip>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {selectedSlots.map((time, index) => (
                <Tr key={index}>
                  <Td>{time}</Td>
                  {roomsAvailability.length > 0 ? (
                    rooms.map((room, roomIndex) => {
                      const roomData = roomsAvailability.find(
                        (r) => r.online_room_id === room.id
                      );
                      let reservationForTimeSlot = "Livre";
                      let reservationId = null;
                      let reservationUserId = null;
                      let reservationEndHour = null;
                      let reservationStartHour = null;
                      let reservationRecurrentId = null;
                      let reservationRecurrentDay = null;

                      if (roomData && roomData.availability !== "Livre") {
                        roomData.availability.forEach((reservation) => {
                          const startTime = format(
                            new Date(`2025-02-03T${reservation.start_time}`),
                            "HH:mm"
                          );
                          const endTime = format(
                            new Date(`2025-02-03T${reservation.end_time}`),
                            "HH:mm"
                          );

                          if (
                            (reservation.recurrent_id === 1 &&
                              time >= startTime &&
                              time < endTime) ||
                            (reservation.recurrent_id === 2 &&
                              time >= startTime &&
                              time < endTime) ||
                            (reservation.recurrent_id === 3 &&
                              time >= startTime &&
                              time < endTime) ||
                            (reservation.recurrent_id === 4 &&
                              time >= startTime &&
                              time < endTime) ||
                            (reservation.recurrent_id === 5 &&
                              time >= startTime &&
                              time < endTime)
                          ) {
                            reservationForTimeSlot = `${reservation.description}`;
                            reservationId = reservation.id;
                            reservationUserId = reservation.user_id;
                            reservationEndHour = `${reservation.end_time}`;
                            reservationStartHour = `${reservation.start_time}`;
                            reservationRecurrentDay = `${reservation.recurrent_day}`;
                            reservationRecurrentId = `${reservation.recurrent_id}`;
                          }
                        });
                      }

                      return (
                        <Td
                          key={`${roomIndex}-${index}`}
                          onClick={() => {
                            if (reservationForTimeSlot === "Livre") {
                              handleSlotClick(
                                room.id,
                                room.name_room,
                                time,
                                selectedSlots
                              );
                            } else {
                              handleOpenDetails(
                                reservationId,
                                reservationUserId,
                                reservationForTimeSlot,
                                reservationStartHour,
                                reservationEndHour,
                                room.name_room,
                                reservationRecurrentId,
                                reservationRecurrentDay,
                                room.id,
                                selectedSlots
                              );
                            }
                          }}
                          sx={{
                            maxWidth: "150px", // Define a largura máxima
                            overflow: "hidden", // Oculta o conteúdo que excede a largura
                            textOverflow: "ellipsis", // Adiciona "..." ao final do texto que não cabe
                            whiteSpace: "nowrap",
                            textAlign:
                              reservationForTimeSlot === "Livre"
                                ? "center"
                                : "default",
                            cursor: "pointer",
                            borderRadius: "5px",
                            background:
                              reservationForTimeSlot !== "Livre"
                                ? "#f8d7da"
                                : "transparent",
                          }}
                        >
                          {reservationForTimeSlot !== "Livre" ? (
                            <div
                              title="Detalhes da Reserva"
                              style={{
                                maxWidth: "100%", // Garante que o div ocupe a largura máxima da célula
                                overflow: "hidden", // Oculta o conteúdo que excede a largura
                                textOverflow: "ellipsis", // Adiciona "..." ao final do texto que não cabe
                                whiteSpace: "nowrap",
                              }}
                            >
                              {reservationForTimeSlot}
                            </div>
                          ) : (
                            reservationForTimeSlot
                          )}
                        </Td>
                      );
                    })
                  ) : (
                    <Td colSpan={rooms.length + 1}>Carregando dados...</Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Reserva para {roomName} no dia {format(selectedDate, "dd/MM/yyyy")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Hora de Início */}
            <FormControl isInvalid={selectedTimeError}>
              <FormLabel>
                Hora de Início <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Select
                required
                placeholder="Selecione o horário de início"
                onChange={handleStartTimeChange}
                borderColor={selectedTimeError ? "red.500" : ""}
                value={selectedTime}
              >
                {availableStartHours.map((startTime, index) => (
                  <option key={index} value={startTime}>
                    {startTime}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Hora de Fim */}
            <FormControl mt={4} isInvalid={endTimeError}>
              <FormLabel>
                Hora de Fim <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Select
                required
                placeholder="Selecione o horário de fim"
                onChange={handleEndTimeChange}
                borderColor={endTimeError ? "red.500" : ""}
                value={endTime}
              >
                {availableEndHours.map((endTime, index) => (
                  <option key={index} value={endTime}>
                    {endTime}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Descrição */}
            <FormControl mt={4} isInvalid={descriptionError}>
              <FormLabel>
                Descrição <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Input
                required
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                borderColor={descriptionError ? "red.500" : ""}
              />
            </FormControl>
              <>
                <FormControl mt={4} isInvalid={recurrenceError}>
                  <FormLabel>
                    Recorrência <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Select
                    value={recurrentId}
                    onChange={handleRecurrenceChange}
                    borderColor={recurrenceError ? "red.500" : ""}
                  >
                    <option value="1">Não Recorrente</option>
                    <option value="2">Todos os dias</option>
                    <option value="3">Semanal</option>
                    <option value="5">Quinzenal</option>
                    <option value="4">Mensal</option>
                  </Select>
                </FormControl>

                {/* Seleção do Dia da Recorrência (Aparece quando necessário) */}
                {recurrentId !== "1" &&
                  recurrentId !== "4" &&
                  recurrentId !== "2" && (
                    <FormControl mt={4}>
                      <FormLabel>
                        Dia da recorrência{" "}
                        <span style={{ color: "red" }}>*</span>
                      </FormLabel>
                      <Select
                        placeholder="Selecione a recorrência"
                        onChange={handleRecurrenceDay}
                      >
                        <option value="Monday">Segunda</option>
                        <option value="Tuesday">Terça</option>
                        <option value="Wednesday">Quarta</option>
                        <option value="Thursday">Quinta</option>
                        <option value="Friday">Sexta</option>
                      </Select>
                    </FormControl>
                  )}
              </>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Reservar
            </Button>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenUpdate} onClose={handleCloseUpdate}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedReservation.id
              ? `Reserva para ${selectedReservation.room}`
              : "Detalhes da Reserva"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Hora de Início */}
            <FormControl isInvalid={selectedTimeError}>
              <FormLabel>
                Hora de Início <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Select
                required
                placeholder="Selecione o horário de início"
                onChange={handleEditStartTimeChange}
                borderColor={selectedTimeError ? "red.500" : ""}
                value={selectedReservation.start}
              >
                {availableStartHours.map((startTime, index) => (
                  <option key={index} value={startTime}>
                    {startTime}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Hora de Fim */}
            <FormControl mt={4} isInvalid={endTimeError}>
              <FormLabel>
                Hora de Fim <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Select
                required
                placeholder="Selecione o horário de fim"
                onChange={handleEditEndTimeChange}
                borderColor={endTimeError ? "red.500" : ""}
                value={selectedReservation.end}
              >
                {availableEndHours.map((endTime, index) => (
                  <option key={index} value={endTime}>
                    {endTime}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Descrição */}
            <FormControl mt={4} isInvalid={descriptionError}>
              <FormLabel>
                Descrição <span style={{ color: "red" }}>*</span>
              </FormLabel>
              <Input
                required
                type="text"
                value={selectedReservation.description}
                onChange={handleEditDescriptionChange}
                borderColor={descriptionError ? "red.500" : ""}
              />
            </FormControl>
              <>
                <FormControl mt={4} isInvalid={recurrenceError}>
                  <FormLabel>
                    Recorrência <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Select
                    value={selectedReservation.recurrentId}
                    onChange={handleRecurrenceEditChange}
                    borderColor={recurrenceError ? "red.500" : ""}
                  >
                    <option value="1">Não Recorrente</option>
                    <option value="2">Todos os dias</option>
                    <option value="3">Semanal</option>
                    <option value="5">Quinzenal</option>
                    <option value="4">Mensal</option>
                  </Select>
                </FormControl>

                {/* Seleção do Dia da Recorrência (Aparece quando necessário) */}
                {recurrentId !== "1" &&
                  recurrentId !== "4" &&
                  recurrentId !== "2" && (
                    <FormControl mt={4}>
                      <FormLabel>
                        Dia da recorrência{" "}
                        <span style={{ color: "red" }}>*</span>
                      </FormLabel>
                      <Select
                        placeholder="Selecione a recorrência"
                        onChange={handleRecurrenceDayEdit}
                      >
                        <option value="Monday">Segunda</option>
                        <option value="Tuesday">Terça</option>
                        <option value="Wednesday">Quarta</option>
                        <option value="Thursday">Quinta</option>
                        <option value="Friday">Sexta</option>
                      </Select>
                    </FormControl>
                  )}
              </>
          </ModalBody>
          <ModalFooter>
            {(selectedReservation.userId === userLogged?.id ||
              userLogged?.role_id === 1) && (
              <Button
                colorScheme="red"
                mr={3}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteModal(
                    selectedReservation.id,
                    selectedReservation.room
                  );
                }}
              >
                Deletar Reserva
              </Button>
            )}
            <Button colorScheme="blue" mr={3} onClick={handleSubmitEdit}>
              Atualizar
            </Button>
            <Button variant="ghost" onClick={handleCloseUpdate}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenDetails} onClose={handleCloseDetails}>
        <ModalOverlay />
        <ModalContent padding={5}>
          <ModalHeader mt={5}>
            <Text fontSize="2xl" textAlign="center" color="gray.700">
              Detalhes da Reserva
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody mt={3} mb={5}>
            {selectedReservation && (
              <VStack spacing={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Descrição:
                  </Text>
                  <Text whiteSpace="pre-wrap" wordBreak="break-word">
                    {selectedReservation.description}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Data e Hora:{" "}
                    <Text as="span" fontWeight="normal">
                      {selectedReservation.start} - {selectedReservation.end}
                    </Text>
                  </Text>
                </Box>
                {(selectedReservation.userId === userLogged?.id ||
                  userLogged?.role_id === 1) && (
                  <Button
                    colorScheme="red"
                    width="100%"
                    mt={4}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModal(
                        selectedReservation.id,
                        selectedReservation.room
                      );
                    }}
                  >
                    Deletar Reserva
                  </Button>
                )}
              </VStack>
            )}
            <Button
              onClick={handleCloseDetails}
              colorScheme="blue"
              width="100%"
              mt={4}
            >
              Fechar
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isModalDeleteOpen} onClose={DeleteModalClose}>
        <ModalOverlay />
        <ModalContent padding={5}>
          <ModalHeader mt={5}>
            Deletar reserva na sala {roomName} no dia{" "}
            {format(selectedDate, "dd/MM/yyyy")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody mt={3} mb={5}>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => handleDeleteReservation(reservationId)}
            >
              Deletar Reserva
            </Button>
            <Button variant="ghost" onClick={DeleteModalClose}>
              Cancelar
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default withAuth(RoomsPage);
