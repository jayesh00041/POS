import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from 'contexts/CartContext';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '../../../../http-routes/';
import InvoicePopup from '../../../../components/invoice/InvoicePopup';

export default function CartComponent() {
  const { cart, removeFromCart } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const createInvoiceMutation = useMutation({
    mutationFn: (formData: any) => createInvoice(formData),
    onSuccess: (data) => {
      setShowInvoice(true);
      setInvoiceData(data.data);
    },
    onError: (error) => console.error('Error creating invoice:', error),
  });

  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalPrice = Object.values(cart).reduce(
    (sum, item) =>
      sum +
      (item.selectedVariation?.price || item.product.price) * item.quantity,
    0,
  );

  if (totalItems === 0) return null;

  const groupedCart = Object.values(cart).reduce((acc, item) => {
    const key = item.product.id;
    if (!acc[key]) {
      acc[key] = { ...item, variations: [] };
    }
    if (item.selectedVariation) {
      acc[key].variations.push(item);
    }
    
    return acc;
  }, {});

  const handleCreateInvoice = () => {
    const invoiceData = {
      customerName,
      mobileNumber,
      paymentMode,
      referenceNumber,
      items: Object.values(cart),
      totalPrice,
    };
    createInvoiceMutation.mutate(invoiceData);
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
        <Icon as={FaShoppingCart as React.ElementType} size={20} />
        <Text ml={2}>₹{totalPrice}</Text>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent p={4} borderRadius="md" boxShadow="lg" maxW="400px">
          <DrawerCloseButton />
          <DrawerHeader textAlign="center">Cart Summary</DrawerHeader>
          <DrawerBody>
            <Box bg="gray.100" p={4} borderRadius="md" boxShadow="lg">
              {Object.values(groupedCart).map((item: any) => (
                <Box key={item.product.id} mb={3}>
                  {item.variations.length > 0 ? (
                    item.variations.map((variation, index) => (
                      <>
                      {
                        (index === 0) ? <Text fontSize="sm" fontWeight="bold">{item.product.name}</Text> : <></>
                      }
                      <Flex
                        key={variation.selectedVariation?._id}
                        align="center"
                        justify="space-between"
                        ml={4}
                      >
                        <Text fontSize="xs" color="gray.600">
                          {variation.selectedVariation.name} x {variation.quantity}
                        </Text>
                        <Text fontSize="sm">
                          ₹{variation.selectedVariation.price * variation.quantity}
                          <Button
                            size="xs"
                            colorScheme="whiteAlpha"
                            textColor="red"
                            onClick={() =>
                              removeFromCart(
                                variation.product.id,
                                variation.selectedVariation?._id,
                              )
                            }
                          >
                            x
                          </Button>
                        </Text>
                      </Flex>
                      </>
                    ))
                  ) : (
                    <Flex align="center" justify="space-between">
                      <Text fontSize="sm" fontWeight="bold">
                        {item.product.name} x {item.quantity}
                      </Text>

                      <Text fontSize="sm">
                        ₹{item.product.price * item.quantity}
                        <Button
                          size="xs"
                          colorScheme="whiteAlpha"
                          textColor="red"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          x
                        </Button>
                      </Text>
                    </Flex>
                  )}
                </Box>
              ))}
              <Divider my={3} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total:</Text>
                <Text>₹{totalPrice}</Text>
              </Flex>
            </Box>
            <Box mt={4}>
              <Text fontSize="sm" mb={1}>
                Customer Name
              </Text>
              <Input
                size="sm"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter name"
              />
            </Box>
            <Box mt={3}>
              <Text fontSize="sm" mb={1}>
                Mobile Number
              </Text>
              <Input
                size="sm"
                type="number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
              />
            </Box>
            <Box mt={3}>
              <Text fontSize="sm" mb={1}>
                Payment Mode
              </Text>
              <Select
                size="sm"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </Select>
            </Box>
            {paymentMode === 'online' && (
              <Box mt={3}>
                <Text fontSize="sm" mb={1}>
                  Reference Number
                </Text>
                <Input
                  size="sm"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter reference number"
                />
              </Box>
            )}
            <Button
              mt={4}
              colorScheme="green"
              size="sm"
              w="full"
              onClick={handleCreateInvoice}
            >
              Create Invoice
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <div>
          {showInvoice && (
              <InvoicePopup invoice={invoiceData} onClose={() => setShowInvoice(false)} />
          )}
      </div>
    </>
  );}
