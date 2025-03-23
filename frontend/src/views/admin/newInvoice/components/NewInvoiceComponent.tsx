import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
} from '@chakra-ui/react';
import ItemComponent from './ItemComponent';
import CartComponent from './CartComponent';
import { useMutation } from '@tanstack/react-query';
import { categoryWiseProducts } from '../../../../http-routes/index';
import { enqueueSnackbar } from 'notistack';

export default function NewInvoiceComponent() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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

  useEffect(() => {
    if (searchTerm) {
      // Flatten all products from all categories
      const allProducts = categories.flatMap((cat) => cat.products);
      // Filter products based on search term
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, categories]);

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="lg"
    >
      {/* Search Bar */}
      <Box mb={4}>
        <Input
          placeholder="Search Product"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />
      </Box>

      {getCategoryWiseProductsMutation.status === 'pending' ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {/* Show search results if search term is not empty */}
          {searchTerm ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredProducts.map((product) => (
                <Box key={product.id}>
                  <ItemComponent product={product} />
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            // Show category tabs if search term is empty
            <Tabs variant="enclosed" colorScheme="blue" orientation={isMobile ? 'vertical' : 'horizontal'}>
              <TabList
                overflowY={isMobile ? 'auto' : 'unset'}
                maxH={isMobile ? 'calc(100vh - 200px)' : 'unset'}
                flexDirection={isMobile ? 'column' : 'row'}
                gap={2}
                pb={isMobile ? 4 : 0}
              >
                {categories.map((cat) => (
                  <Tab
                    key={cat.name}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={2}
                    minW="100px"
                  >
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        boxSize="40px"
                        borderRadius="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Avatar name={cat.name} size="sm" />
                    )}
                    <Text fontSize="xs" mt={2} textAlign="center">
                      {cat.name}
                    </Text>
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {categories.map((cat) => (
                  <TabPanel key={cat.name}>
                    <Flex wrap="wrap" gap={4} justify="center">
                      {cat.products.map((product) => (
                        <Box
                          key={product.id}
                          flex="1 1 calc(33.333% - 16px)"
                          minW="250px"
                        >
                          <ItemComponent product={product} />
                        </Box>
                      ))}
                    </Flex>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          )}
        </>
      )}
      <CartComponent />
    </Box>
  );
}