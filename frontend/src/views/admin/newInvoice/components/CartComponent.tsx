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
  Button,
  Input,
  Select,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "contexts/CartContext";

export default function CartComponent() {
  const { cart, removeFromCart } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.selectedVariation.price * item.quantity,
    0
  );

  if (totalItems === 0) return null;

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
        <FaShoppingCart size={20} />
        <Text ml={2}>₹{totalPrice}</Text>
      </Flex>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Cart Summary</DrawerHeader>
          <DrawerBody>
            {Object.values(cart).map((item) => (
              <Flex key={`${item.product.id}-${item.selectedVariation.name}`} justify="space-between" align="center" mb={3}>
                {item.product.image && <Image src={item.product.image} boxSize="40px" borderRadius="md" />}
                <Text flex="1" mx={2}>
                  {item.product.name} ({item.selectedVariation.name}) x {item.quantity}
                </Text>
                <Text>₹{item.selectedVariation.price * item.quantity}</Text>
                <Button size="xs" colorScheme="red" onClick={() => removeFromCart(item.product.id, item.selectedVariation.name)}>
                  Remove
                </Button>
              </Flex>
            ))}
            <Flex mt={4} justify="space-between" fontWeight="bold">
              <Text>Total:</Text>
              <Text>₹{totalPrice}</Text>
            </Flex>
            <Box mt={4}>
              <Text mb={1}>Customer Name</Text>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" />
            </Box>
            <Box mt={4}>
              <Text mb={1}>Mobile Number</Text>
              <Input type="number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter mobile number" />
            </Box>
            <Box mt={4}>
              <Text mb={1}>Payment Mode</Text>
              <Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </Select>
            </Box>
            {paymentMode === "online" && (
              <Box mt={4}>
                <Text mb={1}>Reference Number</Text>
                <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Enter reference number" />
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
