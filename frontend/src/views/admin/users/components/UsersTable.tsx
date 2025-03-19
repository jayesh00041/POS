import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Tooltip,
  Icon,
  Box,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import UserForm from './UserForm';
import { SearchBar } from '../../../../components/navbar/searchBar/SearchBar';
import { useMutation } from '@tanstack/react-query';
import { getUsers, blockUnblockUser } from 'http-routes';
import { enqueueSnackbar } from 'notistack';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isBlockOpen,
    onOpen: onBlockOpen,
    onClose: onBlockClose,
  } = useDisclosure();

  const getUsersMutation = useMutation({
    mutationFn: () => getUsers(),
    onSuccess: (data) => {
      setUsers(data.data.data);
      setIsLoading(false);
    },
    onError: () => {
      enqueueSnackbar('Error fetching users', { variant: 'error' });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    getUsersMutation.mutate();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, users]);

  const handleBlockUnblock = (id) => {
    setSelectedUser(users.find((u) => u._id === id));
    onBlockOpen();
  };

  const confirmBlock = () => {
    blockUserMutation.mutate(selectedUser._id);
    onBlockClose();
  };

  const blockUserMutation = useMutation({
    mutationFn: (id) => blockUnblockUser(id),
    onSuccess: (response: any) => {
      getUsersMutation.mutate();
      enqueueSnackbar(response.data.status, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar("Error updating satus", { variant: 'error' });
    },
  });

  return (
    <Box>
      <Flex alignItems="center" justify="space-between" gap="10px">
        <SearchBar
          placeholder="Search User"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tooltip label="Add User">
          <Button
            colorScheme="brand"
            height="50px"
            width="50px"
            borderRadius="50%"
            onClick={() => {
              setSelectedUser(null);
              onOpen();
            }}
          >
            <Icon as={FaPlus as React.ElementType} />
          </Button>
        </Tooltip>
      </Flex>

      <TableContainer overflowY="auto" maxH="calc(100vh - 196px)">
        {isLoading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : filteredUsers.length === 0 ? (
          <Flex justify="center" align="center" height="200px">
            <Text fontSize="lg" color="gray.500">No users found.</Text>
          </Flex>
        ) : (
          <Table variant="striped">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                <Th>Avatar</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user._id}>
                  <Td>
                    <Avatar size="sm" name={user.name} src={user.avatarUrl || ''} />
                  </Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.phone}</Td>
                  <Td>{user.role}</Td>
                  <Td>
                    <Button colorScheme={user.isBlocked ? "green" : "red"} size="sm" ml={2} onClick={() => handleBlockUnblock(user._id)}>
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Edit/Add User Modal */}
      <UserForm isOpen={isOpen} onClose={onClose} user={selectedUser} setUsers={setUsers} />

      {/* Block Confirmation Modal */}
      <Modal isOpen={isBlockOpen} onClose={onBlockClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Block</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to {selectedUser?.isBlocked ? "unblock" : "block"} {selectedUser?.name}?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme={selectedUser?.isBlocked ? "green" : "red"} onClick={confirmBlock}>
              Yes, {selectedUser?.isBlocked ? "Unblock" : "Block"}
            </Button>
            <Button ml={3} onClick={onBlockClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UsersTable;
