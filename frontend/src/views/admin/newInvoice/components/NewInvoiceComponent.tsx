import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Spinner,
  Avatar,
  Image,
  useBreakpointValue,
  Input,
  Text,
  SimpleGrid,
  HStack,
  Badge,
  Icon,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaTimes } from 'react-icons/fa';
import ItemComponent from './ItemComponent';
import CartComponent from './CartComponent';
import { useMutation } from '@tanstack/react-query';
import { categoryWiseProducts } from '../../../../http-routes/index';
import { enqueueSnackbar } from 'notistack';

export default function NewInvoiceComponent() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const categoryBg = useColorModeValue('gray.50', 'gray.700');
  const categoryActiveBg = useColorModeValue('blue.500', 'blue.600');
  const categoryActiveColor = useColorModeValue('white', 'white');
  const searchBg = useColorModeValue('gray.50', 'gray.700');
  const searchBorderColor = useColorModeValue('gray.200', 'gray.600');
  const searchFocusBg = useColorModeValue('white', 'gray.700');
  const searchHoverBorder = useColorModeValue('gray.300', 'gray.500');
  const clearButtonHoverBg = useColorModeValue('gray.100', 'gray.600');
  const categoryInactiveColor = useColorModeValue('gray.700', 'gray.300');

  const getCategoryWiseProductsMutation = useMutation({
    mutationFn: () => categoryWiseProducts(),
    onSuccess: (data) => {
      setCategories(data.data.categories);
    },
    onError: (error: any) =>
      enqueueSnackbar(error.data.message, { variant: 'error' }),
  });

  useEffect(() => {
    getCategoryWiseProductsMutation.mutate();
    // eslint-disable-next-line
  }, []);

  // Auto-focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search on Escape
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('');
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      // Flatten all products from all categories
      const allProducts = categories.flatMap((cat) => cat.products);
      // Filter products based on search term
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setSelectedCategory(null); // Clear category selection when searching
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, categories]);

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Get products for selected category or all products
  const getDisplayProducts = () => {
    if (searchTerm) return filteredProducts;
    if (selectedCategory) {
      const category = categories.find((cat) => cat.name === selectedCategory);
      return category?.products || [];
    }
    // Show all products if no category selected
    return categories.flatMap((cat) => cat.products);
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg={bgColor}
    >
      {/* Subtle Search Bar */}
      <Box mb={4} maxW="400px">
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" h="100%">
            <SearchIcon color="gray.400" boxSize={4} />
          </InputLeftElement>
          <Input
            ref={searchInputRef}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
            fontSize="sm"
            bg={searchBg}
            borderWidth="1px"
            borderColor={searchBorderColor}
            _focus={{
              borderColor: 'blue.400',
              bg: searchFocusBg,
              boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)',
            }}
            _hover={{
              borderColor: searchHoverBorder,
            }}
          />
          {searchTerm && (
            <Box
              position="absolute"
              right="8px"
              top="50%"
              transform="translateY(-50%)"
              cursor="pointer"
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              zIndex={1}
              p={1}
              borderRadius="md"
              _hover={{ bg: clearButtonHoverBg }}
            >
              <Icon as={FaTimes as React.ElementType} color="gray.400" boxSize={3} />
            </Box>
          )}
        </InputGroup>
        {searchTerm && (
          <Text fontSize="xs" color="gray.500" mt={1.5} ml={1}>
            {filteredProducts.length} found
          </Text>
        )}
      </Box>

      {/* Horizontal Scrollable Category Pills */}
      {!searchTerm && categories.length > 0 && (
        <Box mb={5} overflowX="auto" pb={2}>
          <HStack spacing={2} align="stretch">
            <Badge
              px={3}
              py={1.5}
              borderRadius="full"
              cursor="pointer"
              bg={selectedCategory === null ? categoryActiveBg : categoryBg}
              color={selectedCategory === null ? categoryActiveColor : categoryInactiveColor}
              fontSize="xs"
              fontWeight={selectedCategory === null ? "600" : "500"}
              whiteSpace="nowrap"
              onClick={() => setSelectedCategory(null)}
              _hover={{ opacity: 0.9 }}
              transition="all 0.2s"
            >
              All Products
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.name}
                px={3}
                py={1.5}
                borderRadius="full"
                cursor="pointer"
                bg={selectedCategory === cat.name ? categoryActiveBg : categoryBg}
                color={selectedCategory === cat.name ? categoryActiveColor : categoryInactiveColor}
                fontSize="xs"
                fontWeight={selectedCategory === cat.name ? "600" : "500"}
                whiteSpace="nowrap"
                onClick={() => setSelectedCategory(cat.name)}
                _hover={{ opacity: 0.9 }}
                transition="all 0.2s"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    boxSize="16px"
                    borderRadius="full"
                    objectFit="cover"
                  />
                ) : (
                  <Avatar name={cat.name} size="2xs" />
                )}
                {cat.name}
                {cat.products?.length > 0 && (
                  <Text as="span" fontSize="2xs" opacity={0.8}>
                    ({cat.products.length})
                  </Text>
                )}
              </Badge>
            ))}
          </HStack>
        </Box>
      )}

      {getCategoryWiseProductsMutation.status === 'pending' ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {getDisplayProducts().length === 0 ? (
            <Flex
              justify="center"
              align="center"
              height="300px"
              direction="column"
              gap={2}
            >
              <Text fontSize="lg" color="gray.500">
                {searchTerm ? 'No products found' : 'No products in this category'}
              </Text>
              {searchTerm && (
                <Text fontSize="sm" color="gray.400">
                  Try a different search term
                </Text>
              )}
            </Flex>
          ) : (
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
              spacing={{ base: 3, md: 3 }}
              minChildWidth={{ base: '100%', sm: '180px', md: '200px' }}
            >
              {getDisplayProducts().map((product) => (
                <Box key={product.id}>
                  <ItemComponent product={product} />
                </Box>
              ))}
            </SimpleGrid>
          )}
        </>
      )}
      <CartComponent />
    </Box>
  );
}