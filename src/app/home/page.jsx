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

import { CalendarIcon } from "@chakra-ui/icons";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [tablesAvailability, setTablesAvailability] = useState([]);
  const [tableID, setTableID] = useState();
  const [tableType, setTableType] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClickTable = (tableID, tableType) => {
    setTableID(tableID);
    setTableType(tableType);
    onOpen();
  };
  const getInfoDate = async (date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setSelectedDate(formattedDate);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}reservations/${formattedDate}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data.data?.tables);
          setTablesAvailability(data.items?.tables);
        });
    }
  };

  useEffect(() => {
    getInfoDate(startDate);
  }, [startDate]);
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
              selected={startDate}
              onChange={(date) => getInfoDate(date)}
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
                    id={tablesAvailability["1"]?.table_id}
                    onClick={() =>
                      handleClickTable(
                        tablesAvailability["1"]?.table_id,
                        tablesAvailability["1"]?.table_type
                      )
                    }
                    cursor={"pointer"}
                  >
                    {tablesAvailability["1"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["1"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["2"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["2"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["2"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["2"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["3"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["3"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["3"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["3"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["5"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["5"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["6"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["6"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["7"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["7"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["9"]?.availability?.Manha === "Livre" &&
                    tablesAvailability["9"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["10"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["10"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={2}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={2}
                  >
                    {tablesAvailability["11"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["11"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["12"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["12"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["13"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["13"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["14"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["14"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["14"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["14"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["15"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["15"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["15"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["15"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["16"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["16"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["16"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["16"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
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
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    {tablesAvailability["17"]?.availability?.Manha ===
                      "Livre" &&
                    tablesAvailability["17"]?.availability?.Tarde === "Livre"
                      ? "Mesa Livre"
                      : "Mesa ocupada"}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["1"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["1"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Brunno{" "}
                  </GridItem>
                  <GridItem
                    bg={
                      tablesAvailability["1"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["1"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
                    minH={"40px"}
                    border={"4px solid #000"}
                    p={5}
                  >
                    Thais{" "}
                  </GridItem>

                  <GridItem
                    bg={
                      tablesAvailability["1"]?.availability?.Manha ===
                        "Livre" &&
                      tablesAvailability["1"]?.availability?.Tarde === "Livre"
                        ? "green"
                        : "red"
                    }
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
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
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
            <Button colorScheme="green">Reservar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
