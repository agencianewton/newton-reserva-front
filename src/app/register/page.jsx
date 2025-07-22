"use client";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Heading,
  Stack,
  Text,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

const users = [
  { id: 1, name: "Adelia Bolzachini", email: "adelia.bolzachini@newton.ag" },
  {
    id: 2,
    name: "Adriano Caramello",
    email: "adriano.caramello@newton.ag",
  },
  {
    id: 3,
    name: "Alessandra Inson",
    email: "alessandra.inson@newton.ag",
  },
  {
    id: 4,
    name: "Alexandre Yokota",
    email: "alexandre.yokota@newton.ag",
  },
  { id: 5, name: "Alice Jung", email: "alice.jung@newton.ag" },
  {
    id: 6,
    name: "Ana Carolina Paulino",
    email: "ana.paulino@newton.ag",
  },
  {
    id: 7,
    name: "Ana Carolina Ventura",
    email: "anamaurino01@gmail.com",
  },
  // { id: 8, name: "Ana Neiva", email: "guimaraesneiva@gmail.com" },
  // { id: 9, name: "Andrea Husti", email: "associados@febrasgo.org.br" },
  { id: 10, name: "André Carvalho", email: "andre.carvalho@newton.ag" },
  {
    id: 11,
    name: "André Pezzuol",
    email: "andre.pezzuol@newton.ag",
  },
  { id: 12, name: "Augusto Solarenco", email: "augusto.solarenco@newton.ag" },
  {
    id: 13,
    name: "Brunno Torquato",
    email: "brunno@newton.ag",
  },
  { id: 14, name: "Bruno Ghirello", email: "bruno.ghirello@newton.ag" },
  {
    id: 15,
    name: "Caique Lemos",
    email: "caique.lemos@newton.ag",
    role_id: 3,
  },
  {
    id: 16,
    name: "Camila Caratti",
    email: "camila.caratti@newton.ag",
  },
  {
    id: 71,
    name: "Caroline Oliveira",
    email: "caroline.oliveira@newton.ag",
  },
  { id: 17, name: "Cindy Souza", email: "cindy.souza@newton.ag" },
  {
    id: 18,
    name: "Cristian Barbosa",
    email: "cristianpbarbosa@hotmail.com",
  },
  {
    id: 19,
    name: "Daniel Augusto",
    email: "daniel.augusto@newton.ag",
  },
  { id: 20, name: "Danilo Gameiro", email: "danilo.gameiro@newton.ag" },
  { id: 21, name: "Elias Rebequi", email: "elias.rebequi@newton.ag" },
  {
    id: 22,
    name: "Ellen Medeiros",
    email: "ellen.medeiros@newton.ag",
  },
  { id: 23, name: "Filipe de Oliveira", email: "filipe@newton.ag" },
  { id: 24, name: "Filipe Santos", email: "filipe.santos@newton.ag" },
  { id: 25, name: "Francisco de Assis", email: "francisco.assis@newton.ag" },
  { id: 26, name: "Gabriela Raposo", email: "gabriela.raposo@newton.ag" },
  { id: 27, name: "Gael Dias", email: "gael.lucena@newton.ag", role_id: 3 },
  { id: 28, name: "Gian Pedrol", email: "gianfranco.pedrol@newton.ag" },
  {
    id: 29,
    name: "Guilherme Henrique Silva",
    email: "guilherme.henrique@newton.ag",
  },
  {
    id: 30,
    name: "Heitor Ranzani",
    email: "heitor.ranzani@newton.ag",
  },
  {
    id: 31,
    name: "bel Machado",
    email: "bel.branco@newton.ag",
  },
  // {
  //   id: 32,
  //   name: "Julia Cavalheiro Dias",
  //   email: "juliacavalheirodias@gmail.com",
  // },
  { id: 33, name: "Juliana de Brito", email: "juliana.brito@newton.ag" },
  {
    id: 34,
    name: "Julie Santos",
    email: "julielen.santos@newton.ag",
  },
  { id: 35, name: "Lais Zamboni", email: "lais.zamboni@newton.ag" },
  { id: 36, name: "Louise Gordon", email: "louise.gordon@newton.ag" },
  {
    id: 37,
    name: "Lucas Santos",
    email: "lucas.santos@newton.ag",
  },
  { id: 38, name: "Luiggi Cantelli", email: "luiggi.cantelli@newton.ag" },
  {
    id: 39,
    name: "Maicon Mendonça",
    email: "maicon.mendonca@newton.ag",
  },
  { id: 40, name: "Marcela Braga", email: "marcela.braga@newton.ag" },
  {
    id: 41,
    name: "Mariana Bertacini",
    email: "mariana.bertacini@newton.ag",
  },
  {
    id: 42,
    name: "Matheus Éboli",
    email: "matheuseboli86@gmail.com",
  },
  { id: 43, name: "Matheus Ribeiro", email: "matheus.ribeiro@newton.ag" },
  { id: 44, name: "Morgana Parisi", email: "morgana.cunha@newton.ag" },
  { id: 45, name: "Nicoly Aragao", email: "nicoly.aragao@newton.ag" },
  { id: 46, name: "Nivia Resende", email: "nivia.resende@newton.ag" },
  { id: 47, name: "Operações", email: "operacoes@newton.ag" },
  { id: 48, name: "Patricia Vianna", email: "patricia.vianna@newton.ag" },
  { id: 49, name: "Patrícia Lopes", email: "patricia@newton.ag" },
  { id: 50, name: "Paulo Cassis", email: "paulo.cassis@newton.ag" },
  {
    id: 51,
    name: "Pedro Mota",
    email: "pedro.mota@newton.ag",
    role_id: 3,
  },
  { id: 52, name: "Rafael Lima", email: "rafael.lima@newton.ag" },
  { id: 53, name: "Rock Carvalho", email: "rock@newton.ag" },
  {
    id: 54,
    name: "Rodolfo Gallo",
    email: "rodolfo.gallo@newton.ag",
    role_id: 3,
  },
  {
    id: 55,
    name: "Sarah Poleto",
    email: "sarah.poleto@newton.ag",
  },
  {
    id: 56,
    name: "Severino Neto",
    email: "severino.neto@newton.ag",
  },
  {
    id: 57,
    name: "Stephanie Bernardo",
    email: "stephanie.bernardo@newton.ag",
  },
  {
    id: 58,
    name: "Tamara Soares",
    email: "tamara.soares@newton.ag",
    role_id: 3,
  },
  {
    id: 70,
    name: "Tayna Lima",
    email: "tayna.lima@newton.ag",
  },
  {
    id: 59,
    name: "Thaila Moura",
    email: "thaila.moura@newton.ag",
  },
  { id: 60, name: "Thais Marques", email: "thais@newton.ag" },
  { id: 61, name: "Thauane Diniz", email: "thauane.diniz@newton.ag" },
  // { id: 62, name: "Thayane", email: "habilitacao@febrasgo.org.br" },
  { id: 63, name: "Thaysa Nunes", email: "thaysa.nunes@newton.ag" },
  {
    id: 69,
    name: "Thiago Carotta",
    email: "thiago.carotta@newton.ag",
  },
  {
    id: 64,
    name: "Thomaz Soutello",
    email: "thomaz.soutello@newton.ag",
  },
  { id: 65, name: "Ton Santos", email: "ton@newton.ag" },
  { id: 66, name: "Victor da Costa", email: "victor@newton.ag" },
  {
    id: 67,
    name: "Vinícius Parisi",
    email: "vinicius.parisi@newton.ag",
  },
  {
    id: 68,
    name: "Vladimir Araujo",
    email: "vladimir.maciel@newton.ag",
  },
  {
    id: 69,
    name: "Oscar Gaspari",
    email: "oscar.gaspari@newton.ag",
  },
];

export default function Register() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState("");
  const [role_id, setRole_Id] = useState("2");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState(true);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isError, setIsError] = useState(false);
  const [roleType, setRoleType] = useState();
  const toast = useToast();
  const router = useRouter();
  const [isEmpty, setIsEmpty] = useState(false);

  const handleUserChange = (event) => {
    const userId = event.target.value;
    const user = users.find((u) => u.id.toString() === userId);
    if (user) {
      setSelectedUser(user);
      setName(user.name);
      setEmail(user.email);
      if (user.role_id === 3) {
        setRoleType("3"); // Diretor de Arte
      } else {
        setRoleType("2"); // Colaborador
      }
      setIsEmailValid(user.email.endsWith("@newton.ag"));
    }
  };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setIsPasswordStrong(
      newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword)
    );
    setDoPasswordsMatch(newPassword === passwordConfirmation);
  };

  const handleSubmit = async () => {
    if (name && isEmailValid && isPasswordStrong && role_id) {
      setIsRegistering(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, role_id, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Registro Realizado",
          description: "Verifique seu e-mail",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.push("/");
      } else {
        toast({
          title: "Erro de registro",
          description: data.error || "Algo deu errado",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setIsRegistering(false);
    } else {
      setIsError(true);
    }
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
      <Stack spacing={8} mx={"auto"} w={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Registre-se
          </Heading>
        </Stack>
        <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8} width={"100%"}>
          <Stack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Nome completo</FormLabel>
              <Select
                placeholder="Selecione um nome"
                onChange={handleUserChange}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>E-mail</FormLabel>
              <Input type="email" value={email} isReadOnly />
            </FormControl>
            <FormControl id="tipo" isRequired>
              <FormLabel>Tipo de usuário</FormLabel>
              <Select
                size="md"
                isReadOnly
                value={roleType} // Isso garante que o Select esteja atualizado com o valor correto
              >
                <option value="3">Diretor de Arte</option>
                <option value="2">Colaborador</option>
              </Select>
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={handlePasswordChange}
                  required
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Registrando..."
                size="lg"
                bg={"blue.500"}
                color={"white"}
                _hover={{ bg: "blue.100" }}
                onClick={handleSubmit}
              >
                Cadastrar
              </Button>
              <Text color="red.500" fontSize="sm">
                A Senha é obrigatória e deve conter letras maiusculas,
                minusculas, números e pelo menos um caractere especial
              </Text>
              {isError && (
                <Text color="red.500" fontSize="sm">
                  Por favor, corrija os erros antes de prosseguir.
                </Text>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
