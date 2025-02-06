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
  const toast = useToast();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const handleSlotClick = (roomId, roomName, time, slots) => {
    slots.push("18:00");
    setSelectedRoomId(roomId);
    setSelectedTime(time);
    setRoomName(roomName);

    const roomData = roomsAvailability.find((r) => r.online_room_id === roomId);

    if (roomData && Array.isArray(roomData.availability)) {
      const takenTimes = roomData.availability
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

      const nextReservation = takenTimes
        .filter((t) => t.startTime > time)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      const availableTimes = slots.filter((slot) => {
        const slotTime = parseISO(`${reserveDate}T${slot}`);
        return (
          slotTime > parseISO(`${reserveDate}T${time}`) &&
          (!nextReservation ||
            slotTime <= parseISO(`${reserveDate}T${nextReservation.startTime}`))
        );
      });

      setAvailableEndTimes(
        availableTimes.map((time) =>
          format(parseISO(`${reserveDate}T${time}`), "HH:mm")
        )
      );
    } else {
      const availableTimes = slots.filter(
        (slot) =>
          parseISO(`${reserveDate}T${slot}`) >
          parseISO(`${reserveDate}T${time}`)
      );
      setAvailableEndTimes(
        availableTimes.map((time) =>
          format(parseISO(`${reserveDate}T${time}`), "HH:mm")
        )
      );
    }

    setIsModalOpen(true);
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

    DeleteModalClose();
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

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
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

  const handleEndTimeChange = (event) => {
    setEndHourRegister(event.target.value);
  };

  const handleRecurrenceChange = (event) => {
    setRecurrentId(event.target.value);
  };
  const handleRecurrenceDay = (event) => {
    setRecurrentDay(event.target.value);
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

  const getOnlineRooms = async () => {
    const token = localStorage.getItem("token");
    console.log(token);
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
      console.log(formattedDate);
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
          console.log("Resposta completa da API:", data);

          if (data && data.onlineRooms) {
            console.log(
              "Dado correto para setRoomsAvailability:",
              data.onlineRooms
            );
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

  let slots = [];
  let startTime = setMinutes(setHours(startOfDay(new Date()), 9), 0);
  let endTime = setMinutes(setHours(startOfDay(new Date()), 18), 0);

  while (startTime < endTime) {
    slots.push(format(startTime, "HH:mm"));
    startTime = addMinutes(startTime, 15); // Adiciona 15 minutos
  }

  useEffect(() => {
    setSelectedDate(
      weekDays.find(
        (day) => day.toDateString() === new Date().toDateString()
      ) || weekDays[0]
    );
  }, [weekOffset]);

  useEffect(() => {
    getUserLogged();
    console.log(userLogged);
  }, []);

  useEffect(() => {
    console.log(userLogged);
  }, [userLogged]);

  useEffect(() => {
    getOnlineRooms();
  }, []);
  useEffect(() => {
    getInfoOnlineRooms(selectedDate);
  }, [selectedDate]); // Só chama a API quando a data mudar

  useEffect(() => {
    if (roomsAvailability.length > 0) {
      console.log("Estado rooms atualizado:", roomsAvailability);
    }
  }, [roomsAvailability]); // Só executa quando `roomsAvailability` tiver dados

  return (
    <>
      <Container mt={30} maxW={"100%"}>
        <Flex justify="space-between" align="center" mb={4} px={4}>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Voltar"
            onClick={() => router.push('/home')}
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
                  <Th key={room.online_room_id}>{room.name_room}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {slots.map((time, index) => (
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
                                slots
                              );
                            }
                          }}
                          style={{
                            cursor:
                              reservationForTimeSlot === "Livre"
                                ? "pointer"
                                : "default",
                            borderRadius: "5px",
                            background:
                              reservationForTimeSlot !== "Livre"
                                ? "#f8d7da"
                                : "transparent",
                          }}
                        >
                          {reservationForTimeSlot}
                          {reservationForTimeSlot !== "Livre" &&
                            (reservationUserId === userLogged?.id ||
                              userLogged?.role_id === 1) && (
                              <IconButton
                                variant="ghost"
                                mr={-20}
                                left={5}
                                colorScheme="red"
                                size="sm"
                                icon={<DeleteIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModal(
                                    reservationId,
                                    room.name_room
                                  );
                                }}
                              />
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
            <FormControl>
              <FormLabel>Hora de Início</FormLabel>
              <Input type="text" value={selectedTime} readOnly />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Hora de Fim</FormLabel>
              <Select
                required
                placeholder="Selecione o horário de fim"
                onChange={handleEndTimeChange}
              >
                {availableEndTimes.map((endTime, index) => (
                  <option key={index} value={endTime}>
                    {endTime}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Descrição</FormLabel>
              <Input
                required
                type="text"
                value={description}
                onChange={handleDescriptionChange}
              />
            </FormControl>
            {userLogged?.role_id === 1 && (
              <>
                <FormControl mt={4}>
                  <FormLabel>Recorrência</FormLabel>
                  <Select onChange={handleRecurrenceChange}>
                    <option value="1">Não Recorrente</option>
                    <option value="2">Todos os dias</option>
                    <option value="3">Semanal</option>
                    <option value="5">Quinzenal</option>
                    <option value="4">Mensal</option>
                  </Select>
                </FormControl>

                {recurrentId !== "1" &&
                  recurrentId !== "4" &&
                  recurrentId !== "2" && (
                    <FormControl mt={4}>
                      <FormLabel>Dia da recorrência</FormLabel>
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
            <Button colorScheme="blue" mr={3} onClick={handleReservation}>
              Reservar
            </Button>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
          </ModalFooter>
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
