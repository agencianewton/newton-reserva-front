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
    updateAvailableEndTimes(selectedReservation.start, selectedReservation.roomId, selectedSlots);
  };

  // Função para alterar a hora de fim (para edição)
  const handleEditEndTimeChange = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      end: event.target.value,
    });
    updateAvailableStartTimes(selectedReservation.end, selectedReservation.roomId, selectedSlots);
  };

  const handleRecurrenceEditChange = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      recurrentId: event.target.value,
    });
  };
  const handleRecurrenceDayEdit = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      recurrentDay: event.target.value,
    });
  };

  // Função para alterar a descrição (para edição)
  const handleEditDescriptionChange = (event) => {
    setSelectedReservation({
      ...selectedReservation,
      description: event.target.value,
    });
  };

  // Função para enviar as alterações da reserva (simulando uma requisição de atualização)
  const handleSubmitEdit = async () => {
    // Lógica de validação dos dados (hora de início, fim, descrição)
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

    const token = localStorage.getItem("token");
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

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}reservation/onlineRoom/update/`+selectedReservation.id,
      {
        method: "PUT",
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
        title: "Reserva Atualizada com sucesso",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      getInfoOnlineRooms(selectedDate);
    } else {
      toast({
        title: "Erro ao atualizar",
        description: responseData.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    console.log("reserva Atualizada com sucesso: ", data);

    handleCloseUpdate();
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}onlineRoom/delete/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        console.log("Reserva deletada com sucesso");
        getInfoOnlineRooms(selectedDate);
      } else {
        console.error("Erro ao deletar a reserva", data.error);
      }
    } catch (error) {
      console.error("Erro ao deletar a reserva", error);
    }
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
    const token = localStorage.getItem("token");
    const data = {
      online_room_id: selectedRoomId,
      date: reserveDate,
      recurrent_id: recurrentId,
      recurrent_day: recurrentDay,
      description: description,
      start_time: selectedTime,
      end_time: endHourRegister,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}reservation/onlineRoom`,
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
      getInfoOnlineRooms(selectedDate);
    } else {
      toast({
        title: "Erro ao reservar",
        description: responseData.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    console.log("reserva efetuada com sucesso: ", data);
    closeModal();
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
    const token = localStorage.getItem("token");
    console.log(token);
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
        setAuthUserId(data.id);
      })
      .catch((error) => {
        console.error("Erro ao buscar o usuário logado:", error);
      });
  };

  const getOnlineRooms = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}get/onlineRooms`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro na requisição");
        }
        return response.json();
      })
      .then((data) => {
        setRooms(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar as salas:", error);
      });
  };

  const getInfoOnlineRooms = async (date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}onlineRooms/${formattedDate}`,
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
          if (data && data.onlineRooms) {
            setReserveDate(data?.date);
            setRoomsAvailability(data?.onlineRooms);
          } else {
            console.error("Erro: 'onlineRooms' não está na resposta:", data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
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

  const selectedSlots = getSlots(selectedDate);

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
                  <Th key={room.online_room_id} textAlign="center">
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

            {/* Recorrência (Somente para Admins) */}
            {userLogged?.role_id === 1 && (
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
            )}
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
            {/* Recorrência (Somente para Admins) */}
            {userLogged?.role_id === 1 && (
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
            )}
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
