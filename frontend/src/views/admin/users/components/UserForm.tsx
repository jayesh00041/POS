import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Avatar,
  Box,
  Select,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { addOrUpdateUser } from "http-routes";
import { enqueueSnackbar } from "notistack";

const UserForm = ({ isOpen, onClose, user, setUsers }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setRole(user?.role || "");
  }, [user]);

  const handleSubmit = () => {
    const payload = {
      name,
      email,
      phone,
      role,
    };
    addOrUpdateUserMutation.mutate(payload);
    onClose();
  };

  const addOrUpdateUserMutation = useMutation({
    mutationFn: (reqData: any) => addOrUpdateUser(reqData), 
    onSuccess: (response: any) => {
      setUsers((prevUsers) => {
        if (user?._id) {
          return prevUsers.map((u) =>
            u._id === user._id ? response.data.data : u
          );
        } else {
          return [...prevUsers, response.data.data];
        }
      });
      enqueueSnackbar(response.data.message, { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Error adding/updating user", { variant: "error" });
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user ? "Edit User" : "Add User"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Phone</FormLabel>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Select Role</option>
                  <option value="biller">Biller</option>
                  <option value="admin">Admin</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>{user ? "Update" : "Add"}</Button>
          <Button ml={3} onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserForm;
