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
import { MdDelete, MdEdit } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import CategoryForm from './CategoryForm';
import { SearchBar } from '../../../../components/navbar/searchBar/SearchBar';
import { useMutation } from '@tanstack/react-query';
import { getCategories, deleteCategory } from 'http-routes';
import { enqueueSnackbar } from 'notistack';
import { usePrivilege, Privilege } from '../../../../contexts/PrivilegeContext';

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const { isUserAuthorised } = usePrivilege();

  const getCategoriesMutation = useMutation({
    mutationFn: () => getCategories(),
    onSuccess: (data: any) => {
      setCategories(data.data.data);
      setIsLoading(false);
    },
    onError(error) {
      enqueueSnackbar('Error fetching categories:', { variant: 'error' });
      setIsLoading(false);
    },
  });
  
  useEffect(() => {
    getCategoriesMutation.mutate();
    // eslint-disable-next-line
  }, []);


  useEffect(() => {
    setFilteredCategories(
      categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, categories]);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    onOpen();
  };

  const handleDelete = (id) => {
    setSelectedCategory(categories.find((c) => c._id === id));
    onDeleteOpen();
  };

  const confirmDelete = () => {
    deleteCategoryMutation.mutate(selectedCategory._id);
    onDeleteClose();
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      setCategories((prevCategories) =>
        prevCategories.filter((c) => c._id !== selectedCategory._id),
      );
      enqueueSnackbar('Category deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Error deleting category', { variant: 'error' });
    },
  });

  return (
    <Box>
      <Flex alignItems="center" justify="space-between" gap="10px">
        <SearchBar
          placeholder="Search Category"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tooltip label="Add Category">
          <Button
            colorScheme="brand"
            height="50px"
            width="50px"
            borderRadius="50%"
            onClick={() => {
              setSelectedCategory(null);
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
        ) : filteredCategories.length === 0 ? (
          <Flex justify="center" align="center" height="200px">
            <Text fontSize="lg" color="gray.500">No categories found.</Text>
          </Flex>
        ) : (
          <Table variant="striped">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                <Th>Avatar</Th>
                <Th>Name</Th>
                <Th>Counter No.</Th>
                <Th>Total Products</Th>
                {isUserAuthorised(Privilege.PRODUCTS_WRITE,<Th>Actions</Th>)}
              </Tr>
            </Thead>
            <Tbody>
              {filteredCategories.map((category) => (
                <Tr key={category._id}>
                  <Td>
                    <Avatar
                      size="sm"
                      name={category.name}
                      src={category.imageUrl || ''}
                    />
                  </Td>
                  <Td>{category.name}</Td>
                  <Td>{category.counterNo}</Td>
                  <Td>{category.totalProducts}</Td>
                  {isUserAuthorised(Privilege.PRODUCTS_WRITE,
                    <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Icon as={MdEdit as React.ElementType} width="15px" height="15px" />
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      ml={2}
                      onClick={() => handleDelete(category._id)}
                    >
                      <Icon as={MdDelete as React.ElementType} width="15px" height="15px" />
                    </Button>
                  </Td>
                  )}
                  
                  
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Edit/Add Category Modal */}
      <CategoryForm
        isOpen={isOpen}
        onClose={onClose}
        category={selectedCategory}
        setCategories={setCategories}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete {selectedCategory?.name}?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={confirmDelete}>
              Yes, Delete
            </Button>
            <Button ml={3} onClick={onDeleteClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CategoriesTable;
