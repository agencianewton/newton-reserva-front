"use client";

import { useState } from "react";
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
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const router = useRouter();

  const submitLogin = async (event) => {
    event.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (res.ok) {
      toast({
        title: "Login realizado",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/home");
    } else {
      toast({
        title: "Erro de login",
        description: data.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
      <Stack spacing={8} mx={"auto"} w={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Faça seu Login</Heading>
        </Stack>
        <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8}>
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Seu E-mail</FormLabel>
              <Input type="email" onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                <Checkbox>Lembrar de mim </Checkbox>
                <NextLink href="/forgot-password" passHref>
                  <Text color="blue.400" cursor="pointer">
                    Esqueceu a Senha?
                  </Text>
                </NextLink>
              </Stack>
              <Button
                bg={"blue.400"}
                color={"white"}
                onClick={submitLogin}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Entrar
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={10} marginTop={5}>
            <Stack
              direction={{ base: "column", sm: "row" }}
              align={"start"}
              justify={"space-between"}
            >
              <Text>Não é cadastrado? </Text>
              <NextLink href="/register" passHref>
                Faça seu cadastro
              </NextLink>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
