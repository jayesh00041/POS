import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../../http-routes/index';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import { useUser } from 'contexts/UserContext';

function SignIn() {
  console.log("hi...................");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { loginUser } = useUser();

  const navigate = useNavigate();

  const handleSignIn = async () => {
    loginMutation.mutate({ email, password });
  };

  const loginMutation = useMutation({
    mutationFn: (reqData: { email: string; password: string }) =>
      login(reqData),
    onSuccess: (response) => {
      loginUser(response.data.data);
      navigate('/admin/');
    },
    onError: (error: any) => {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    },
  });

  return (
    <Box width="100vw" height="100vh">
      <Flex
        maxW={{ base: '100%', md: '420px' }}
        w="100%"
        mx="auto"
        minH="100vh"
        flexDirection="column"
        justifyContent="center"
      >
        <Box>
          <Heading fontSize="36px" mb="10px">
            Sign In
          </Heading>
        </Box>
        {error && <Text color="red.500">{error}</Text>}
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="mail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement>
              <Button size="sm" onClick={() => setShowPassword(!showPassword)}>
                <Icon
                  as={showPassword ? FaRegEye as React.ElementType : FaRegEyeSlash as React.ElementType}
                  boxSize="15px"
                />
              </Button>
            </InputRightElement>
          </InputGroup>
          <Button mt="20px" w="100%" isLoading={loading} onClick={handleSignIn}>
            Sign In
          </Button>
        </FormControl>
        <Text mt="10px">
          Not registered yet? Ask admins to create an account.
        </Text>
      </Flex>
    </Box>
  );
}

export default SignIn;
