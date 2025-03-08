import React, { useEffect, useState } from 'react';
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
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from 'contexts/CartContext';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '../../../../http-routes/';
import InvoicePopup from '../../../../components/invoice/InvoicePopup';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import qrImage from 'assets/img/jj-icon.png';

import { QRCodeCanvas } from 'qrcode.react';
import { enqueueSnackbar } from 'notistack';

export default function CartComponent() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  let textColor = useColorModeValue('secondaryGray.500', 'white');

  const createInvoiceMutation = useMutation({
    mutationFn: async (formData: any) => createInvoice(formData),
    onSuccess: (data) => {
      setInvoiceData(data.data.invoice);
    },
    onError: (error) =>
      enqueueSnackbar('Error creating invoice', { variant: 'error' }),
  });

  useEffect(() => {
    if (invoiceData) 
      setShowInvoice(true);
    else
      setShowInvoice(false);

  }, [invoiceData]);
  
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

  const upiUrl = `upi://pay?pa=madanmistry1@ybl&pn=Juicy Jalso&am=${totalPrice}&tn=Juicy Jalso payment&cu=INR`;

  const handlePaymentModeChange = (e) => {
    setPaymentMode(e.target.value);
    if (e.target.value === 'online') {
      setIsQRModalOpen(true);
    }
  };

  const handleApprovePayment = () => {
    setIsQRModalOpen(false);
    handleCreateInvoice();
  };

  const handdleQrModalClose = () => {
    setIsQRModalOpen(false);
    setPaymentMode('cash');
  }
  
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
                        {index === 0 ? (
                          <Text fontSize="sm" fontWeight="bold" color="black">
                            {item.product.name}
                          </Text>
                        ) : (
                          <></>
                        )}
                        <Flex
                          key={variation.selectedVariation?._id}
                          align="center"
                          justify="space-between"
                          ml={4}
                        >
                          <Text fontSize="xs" color="gray.600">
                            {variation.selectedVariation.name} x{' '}
                            {variation.quantity}
                          </Text>
                          <Text fontSize="sm" color="black">
                            ₹
                            {variation.selectedVariation.price *
                              variation.quantity}
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
                      <Text fontSize="sm" fontWeight="bold" color="black">
                        {item.product.name} x {item.quantity}
                      </Text>

                      <Text fontSize="sm" color="black">
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
              <Divider my={3} borderColor="gray.300" />
              <Flex justify="space-between" fontWeight="bold">
                <Text color="black">Total:</Text>
                <Text color="black">₹{totalPrice}</Text>
              </Flex>
            </Box>
            <Box mt={4}>
              <Text fontSize="sm" mb={1}>
                Customer Name
              </Text>
              <Input
                size="sm"
                color={textColor}
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
                color={textColor}
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
                onChange={handlePaymentModeChange}
                color={textColor}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </Select>
            </Box>
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

      

      <Modal isOpen={isQRModalOpen} onClose={handdleQrModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan to Pay</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" justifyContent="center">
              <QRCodeCanvas
                value={upiUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                imageSettings={{
                  src: qrImage,
                  height: 40, // Image height in pixels
                  width: 40, // Image width in pixels
                  excavate: true, // Makes the background of the image transparent
                }}
              />
            </Box>
            <Text mt={3} textAlign="center">
              Amount: ₹{totalPrice}
            </Text>
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
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleApprovePayment}>
              Approve
            </Button>
            <Button
              colorScheme="red"
              onClick={handdleQrModalClose}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {createInvoiceMutation.status === 'pending' && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(255, 255, 255, 0.8)" // Semi-transparent background
          justify="center"
          align="center"
          zIndex="9999"
        >
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        </Flex>
      )}
      
      <InvoicePopup
        isOpen={showInvoice}
        invoice={invoiceData}
        duplicateCopy={false}
        onClose={() => {
          clearCart();
          setInvoiceData(null);
        }}
      />
    </>
  );
}
