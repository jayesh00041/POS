import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import ItemComponent from "./ItemComponent";
import CartComponent from "./CartComponent";

export default function NewInvoiceComponent() {
  const [categories, setCategories] = useState([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    fetch("https://mocki.io/v1/531e17ca-c463-402e-9fc4-7f102aad1a1c") // Replace with actual API
      .then((res) => res.json())
      .then((data) => setCategories(data.categories));
  }, []);

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="lg"
    >
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          {categories.map((cat) => (
            <Tab key={cat.name}>{cat.name}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {categories.map((cat) => (
            <TabPanel key={cat.name}>
              <Flex wrap="wrap" gap={4} justify="center">
                {cat.products.map((product) => (
                  <Box key={product.id} flex="1 1 calc(33.333% - 16px)" minW="250px">
                    <ItemComponent product={product} />
                  </Box>
                ))}
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <CartComponent />
    </Box>
  );
}
