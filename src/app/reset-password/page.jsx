'use client';

import React, { useState, useEffect } from "react";
import {
  Flex,
  Stack,
  Heading,
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  // Pega token e email da URL quando o componente monta
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const e = params.get("email");
    setToken(t);
    setEmail(e);
  }, []);

  if (!token || !email) {
    return (
      <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
        <Text color="red.500" fontSize="xl">
          Token ou e-mail inválidos ou não fornecidos.
        </Text>
      </Flex>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, password_confirmation: confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao resetar senha");
      }
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/");
      }, 3000);
      if (res.ok) {
        toast({
          title: "Sucesso!",
          description: "Sua senha foi alterada com sucesso, retornando para a página de login.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
      <Stack spacing={8} mx={"auto"} w={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"3xl"}>Redefinir Senha</Heading>
          <Text fontSize={"md"} color={"gray.600"}>
            Insira sua nova senha abaixo.
          </Text>
          <Text fontSize={"sm"} color={"gray.500"}>
            Email: {email}
          </Text>
        </Stack>
        <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="password" isRequired>
                <FormLabel>Nova Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </FormControl>
              <FormControl id="confirmPassword" isRequired>
                <FormLabel>Confirmar Senha</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </FormControl>
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Enviando"
                bg={"blue.400"}
                color={"white"}
                _hover={{ bg: "blue.500" }}
              >
                Alterar Senha
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}