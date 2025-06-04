"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export default function forgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleForgotPassword = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Sucesso!",
          description: data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Erro!",
          description: data.message || "Erro ao enviar e-mail.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container mt={30} maxW={"100%"}>
      <Flex justify="space-between" align="center" mb={4} px={4}>
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Voltar"
          onClick={() => router.push("/")}
          colorScheme="gray"
        />
      </Flex>
      <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"white"}>
        <Stack spacing={8} mx={"auto"} w={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"3xl"}>Recuperar Senha</Heading>
            <Text fontSize={"md"} color={"gray.600"}>
              Insira seu e-mail para receber instruções de redefinição
            </Text>
          </Stack>
          <Box rounded={"lg"} bg={"white"} boxShadow={"lg"} p={8}>
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>E-mail</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <Button
                isLoading={loading}
                loadingText="Enviando"
                bg={"blue.400"}
                color={"white"}
                onClick={handleForgotPassword}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Enviar
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </Container>
  );
}
