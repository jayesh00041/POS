import React, { useState } from "react";
import {
  Box,
  Text,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Button,
  Input,
  Select,
  Divider,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "contexts/CartContext";
import { useMutation } from "@tanstack/react-query";
import { createInvoice } from "../../../../http-routes/";

export default function CartComponent() {
  const { cart, removeFromCart } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");

  const createInvoiceMutation = useMutation({
    mutationFn: (formData: any) => createInvoice(formData),
    onSuccess: (data) => {
      console.log("Invoice created successfully:", data);
    },
    onError: (error) => {
      console.error("Error");
    }
  });

  const groupedCart = Object.values(cart).reduce((acc, item) => {
    if (!acc[item.product.name]) {
      acc[item.product.name] = [];
    }
    acc[item.product.name].push(item);
    return acc;
  }, {});

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce(
    (sum, item) => (item?.selectedVariation) ? 
      (sum + item.selectedVariation.price * item.quantity) : 
      (sum + item.price * item.quantity),
    0
  );

  if (totalItems === 0) return null;

  const handleCreateInvoice = () => {
    const invoiceData = {
      customerName,
      mobileNumber,
      paymentMode,
      referenceNumber,
      items: cart,
      totalPrice,
    };
    createInvoiceMutation.mutate(invoiceData);
    console.log("Invoice Created:", invoiceData);
    onClose();
  };

  return (
    <>
      <Flex
        position="fixed"
        bottom="20px"
        right="20px"
        bg="blue.500"
        color="white"
        p={3}
        borderRadius="md"
        boxShadow="lg"
        align="center"
        cursor="pointer"
        onClick={onOpen}
      >
        <Icon as={FaShoppingBag as React.ElementType} size={20} />
        <Text ml={2}>₹{totalPrice}</Text>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent p={4} borderRadius="md" boxShadow="lg" maxW="400px">
          <DrawerCloseButton />
          <DrawerHeader textAlign="center">Cart Summary</DrawerHeader>
          <DrawerBody>
            <Box bg="gray.100" p={4} borderRadius="md" boxShadow="lg">
              {Object.entries(groupedCart).map(([productName, variations]) => (
                <Box key={productName} mb={3}>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>{productName}</Text>
                  {(variations as any[]).map((item) => (
                    <Flex key={`${item.product._id}-${item.selectedVariation._id}`} align="center" justify="space-between" ml={4}>
                      <Box flex="1">
                        <Text fontSize="xs" color="gray.600">
                          {item.selectedVariation.name} x {item.quantity}
                        </Text>
                      </Box>
                      <Text fontSize="sm" mr="8px">₹{item.selectedVariation.price * item.quantity}</Text>
                      <Button size="xs" padding="1px" colorScheme="whiteAlpha" onClick={() => removeFromCart(item.product._id, item.selectedVariation.name)}>
                        <Text fontSize="xs" color="red">
                          x
                        </Text>
                      </Button>
                    </Flex>
                  ))}
                </Box>
              ))}
              <Divider my={3} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total:</Text>
                <Text>₹{totalPrice}</Text>
              </Flex>
            </Box>
            <Box mt={4}>
              <Text fontSize="sm" mb={1}>Customer Name</Text>
              <Input size="sm" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" />
            </Box>
            <Box mt={3}>
              <Text fontSize="sm" mb={1}>Mobile Number</Text>
              <Input size="sm" type="number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter mobile number" />
            </Box>
            <Box mt={3}>
              <Text fontSize="sm" mb={1}>Payment Mode</Text>
              <Select size="sm" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </Select>
            </Box>
            {paymentMode === "online" && (
              <Box mt={3}>
                <Text fontSize="sm" mb={1}>Reference Number</Text>
                <Input size="sm" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Enter reference number" />
              </Box>
            )}
            <Button mt={4} colorScheme="green" size="sm" w="full" onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );}
