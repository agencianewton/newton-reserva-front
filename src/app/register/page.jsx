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
  useColorModeValue,
  Link,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState();
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordStrong, setIsPasswordStrong] = useState(true);
  const [passwordConfirmation, setPasswordConfirmation] = useState(true);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isError, setIsError] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setIsEmailValid(newEmail.endsWith("@newton.ag"));
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

  const handlePasswordConfirmationChange = (event) => {
    const newPasswordConfirmation = event.target.value;
    setPasswordConfirmation(newPasswordConfirmation);
    setDoPasswordsMatch(newPasswordConfirmation === password);
  };

  const handleSubmit = async () => {
    if (name && isEmailValid && isPasswordStrong && doPasswordsMatch) {
      setIsRegistering(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
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
        router.push("/login");
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
              <Input
                type="text"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                name="email"
                onChange={handleEmailChange}
                isInvalid={!isEmailValid}
                required
              />
              {!isEmailValid && (
                <Text color="red.500" fontSize="sm">
                  O e-mail deve ser do domínio newton.ag
                </Text>
              )}
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={handlePasswordChange}
                  name="password"
                  required
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {!isPasswordStrong && (
                <Text color="red.500" fontSize="sm">
                  A senha deve ter pelo menos 8 caracteres, incluindo pelo menos
                  uma letra maiúscula, uma letra minúscula, um número e um
                  caractere especial.
                </Text>
              )}
            </FormControl>
            <FormControl id="passwordConfirmation" isRequired>
              <FormLabel>Confirme sua senha</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={handlePasswordConfirmationChange}
                  required
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {!doPasswordsMatch && (
                <Text color="red.500" fontSize="sm">
                  As senhas não coincidem
                </Text>
              )}
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Registrando..."
                size="lg"
                bg={"blue.500"}
                color={"white"}
                _hover={{
                  bg: "blue.100",
                }}
                disabled={
                  !isEmailValid ||
                  !isPasswordStrong ||
                  !doPasswordsMatch ||
                  isRegistering
                }
                onClick={handleSubmit}
              >
                Cadastrar
              </Button>
              {isError && (
                <Text color="red.500" fontSize="sm">
                  Por favor, corrija os erros antes de prosseguir com o
                  registro.
                </Text>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
