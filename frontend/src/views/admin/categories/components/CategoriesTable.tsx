import React, { useEffect, useState } from "react";
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
  useToast,
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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import CategoryForm from "./CategoryForm";
import { SearchBar } from "components/navbar/searchBar/SearchBar";

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetch(process.env.REACT_APP_CATEGORY_API)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setFilteredCategories(data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    setFilteredCategories(
      categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, categories]);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    onOpen();
  };

  const handleDelete = (id) => {
    setSelectedCategory(categories.find((c) => c.id === id));
    onDeleteOpen();
  };

  const confirmDelete = () => {
    fetch(`http://localhost:8000/api/categories/${selectedCategory.id}`, {
      method: "DELETE",
    })
      .then(() => {
        setCategories(categories.filter((c) => c.id !== selectedCategory.id));
        toast({
          title: "Category deleted.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => console.error("Error deleting category:", error));
    onDeleteClose();
  };

  return (
    <Box>
      <Flex alignItems='center' justify='space-between' gap='10px'>
        <SearchBar placeholder="Search Category" onChange={(e) => setSearchTerm(e.target.value)} />
        <Tooltip label='Add Category'>
          <Button colorScheme='brand' height="50px" width="50px" borderRadius='50%' onClick={() => {
            setSelectedCategory(null);
            onOpen();
          }}>
            <Icon as={FaPlus} />
          </Button>
        </Tooltip>
      </Flex>

      <TableContainer overflowY="auto" maxH="calc(100vh - 196px)">
        <Table variant="striped">
          <Thead position="sticky" top={0} bg="white" zIndex={1}>
            <Tr>
              <Th>Avatar</Th>
              <Th>Category ID</Th>
              <Th>Name</Th>
              <Th>Counter No.</Th>
              <Th>Total Products</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCategories.map((category) => (
              <Tr key={category.id}>
                <Td>
                  <Avatar size="sm" name={category.name} src={category.imageUrl || ""} />
                </Td>
                <Td>{category.id}</Td>
                <Td>{category.name}</Td>
                <Td>{category.counterNo}</Td>
                <Td>{category.totalProducts}</Td>
                <Td>
                  <Button colorScheme="blue" size="sm" onClick={() => handleEdit(category)}>
                    <Icon as={MdEdit} width="15px" height="15px" />
                  </Button>
                  <Button colorScheme="red" size="sm" ml={2} onClick={() => handleDelete(category.id)}>
                    <Icon as={MdDelete} width="15px" height="15px" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Edit/Add Category Modal */}
      <CategoryForm isOpen={isOpen} onClose={onClose} category={selectedCategory} />

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
            <Button colorScheme="red" onClick={confirmDelete}>Yes, Delete</Button>
            <Button ml={3} onClick={onDeleteClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CategoriesTable;
