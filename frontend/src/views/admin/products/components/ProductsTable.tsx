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
import ProductForm from './ProductForm';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { useMutation } from '@tanstack/react-query';
import { getProducts, deleteProduct } from 'http-routes';
import { enqueueSnackbar } from 'notistack';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const getProductsMutation = useMutation({
    mutationFn: () => getProducts(),
    onSuccess: (data) => {
      setProducts(data.data.data);
      setFilteredProducts(data.data.data);
    },
    onError: () => {
      enqueueSnackbar('Error fetching products', { variant: 'error' });
    },
  });
  
  useEffect(() => {
    getProductsMutation.mutate();
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, products]);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleDelete = (id) => {
    setSelectedProduct(products.find((p) => p._id === id));
    onDeleteOpen();
  };

  const confirmDelete = () => {
    deleteProductMutation.mutate(selectedProduct._id);
    onDeleteClose();
  };

  const deleteProductMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== selectedProduct._id),
      );
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Error deleting product', { variant: 'error' });
    },
  });

  return (
    <Box>
      <Flex alignItems="center" justify="space-between" gap="10px">
        <SearchBar
          placeholder="Search Product"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tooltip label="Add Product">
          <Button
            colorScheme="brand"
            height="50px"
            width="50px"
            borderRadius="50%"
            onClick={() => {
              setSelectedProduct(null);
              onOpen();
            }}
          >
            <Icon as={FaPlus as React.ElementType} />
          </Button>
        </Tooltip>
      </Flex>

      <TableContainer overflowY="auto" maxH="calc(100vh - 196px)">
        {getProductsMutation.status === 'pending' ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : filteredProducts.length === 0 ? (
          <Flex justify="center" align="center" height="200px">
            <Text fontSize="lg" color="gray.500">
              No products found.
            </Text>
          </Flex>
        ) : (
          <Table variant="striped">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                <Th>Avatar</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Variations</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <Avatar
                      size="sm"
                      name={product.name}
                      src={product.imageUrl || ''}
                    />
                  </Td>
                  <Td>{product.name}</Td>
                  <Td>{product?.categoryId?.name || "-"}</Td>
                  <Td>{product.price}</Td>
                  <Td>
                    {product?.variations?.length > 0 ? (
                      <>
                        {product.variations.slice(0, 2).map((v, index) => (
                          <p key={index}>
                            {v.name} - ₹{v.price}
                          </p>
                        ))}
                        {product.variations.length > 2 && (
                          <Tooltip
                            label={product.variations
                              .slice(2)
                              .map((v) => `${v.name} - ₹${v.price}`)
                              .join('\n')}
                            hasArrow
                            placement="bottom"
                          >
                            <span>+{product.variations.length - 2} more</span>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Icon as={MdEdit as React.ElementType} width="15px" height="15px" />
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      ml={2}
                      onClick={() => handleDelete(product._id)}
                    >
                      <Icon as={MdDelete as React.ElementType} width="15px" height="15px" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Edit/Add Product Modal */}
      <ProductForm
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
        setProducts={setProducts}
      />

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

export default ProductsTable;
