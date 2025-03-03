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
  Input,
  FormControl,
  FormLabel,
  useToast,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  VStack,
  Box,
  Icon,
  Flex,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import ProductForm from "./ProductForm";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { SearchBar } from "components/navbar/searchBar/SearchBar";

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetch("https://mocki.io/v1/7401171d-7abd-43cd-ba91-41d84660c4f4")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        Object.values(product).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }, [searchTerm, products]);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setCategory(product.category);
    onOpen();
  };

  const handleDelete = (id) => {
    setSelectedProduct(products.find((p) => p.id === id));
    onDeleteOpen();
  };

  const confirmDelete = () => {
    fetch(`http://localhost:8000/api/products/${selectedProduct.id}`, {
      method: "DELETE",
    })
      .then(() => {
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        toast({
          title: "Product deleted.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => console.error("Error deleting product:", error));
    onDeleteClose();
  };

  const bgColor = useColorModeValue('brand.500', 'white');

  return (
    <Box>
      <Flex alignItems='center' flexDirection='row' gap='10px' justify='space-between'>
        {/* <InputGroup position="sticky" top={0} zIndex={1} bg="white" width='40%'>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </InputGroup> */}
        <SearchBar placeholder="Search Product" onChange={(e) => setSearchTerm(e.target.value)}></SearchBar>
        <Tooltip label='Add Product'>
          <Button colorScheme='brand'  height="50px" width="50px" borderRadius='50%' onClick={() => {
      setSelectedProduct(null);
      onOpen();
    }}>
            <Icon as={FaPlus}></Icon>
          </Button>
        </Tooltip>
      </Flex>

      <TableContainer overflowY="auto" maxH="calc(100vh - 196px)" color='white.500'>
        <Table variant="striped">
          <Thead position="sticky" top={0} bg="white" zIndex={1}>
            <Tr>
              <Th>Avatar</Th>
              <Th>Product ID</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Counter No.</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredProducts.map((product) => (
              <Tr key={product.id}>
                <Td>
                  <Avatar size="sm" name={product.name} src={product.imageUrl || ""} />
                </Td>
                <Td>{product.id}</Td>
                <Td>{product.name}</Td>
                <Td>{product.category}</Td>
                <Td>{product.price.includes("₹") ? "" : "₹"}{product.price}</Td>
                <Td>{product.counterNo}</Td>
                <Td>
                  <Button colorScheme="blue" size="sm" onClick={() => handleEdit(product)}>
                    <Icon as={MdEdit} width="15px" height="15px" color="inherit" />
                  </Button>
                  <Button colorScheme="red" size="sm" ml={2} onClick={() => handleDelete(product.id)}>
                    <Icon as={MdDelete} width="15px" height="15px" color="inherit" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Edit/Add Product Modal */}
      <ProductForm isOpen={isOpen} onClose={onClose} product={selectedProduct} category={category} setCategory={setCategory} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete {selectedProduct?.name}?
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

export default ProductsTable;
