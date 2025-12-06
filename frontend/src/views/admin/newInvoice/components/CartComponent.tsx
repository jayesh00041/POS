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
  VStack,
} from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../../../contexts/CartContext';
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

  // Keyboard shortcuts for cart - MUST be before any conditional returns
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when drawer is open
      if (!isOpen) return;
      
      // Enter to checkout
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (totalItems > 0 && !createInvoiceMutation.isPending) {
            handleCreateInvoice();
          }
        }
      }
      // Escape to close
      if (e.key === 'Escape') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, totalItems, createInvoiceMutation.isPending]);

  // Early return after all hooks
  if (totalItems === 0) return null;
  
  return (
    <>
      <Flex
        position="fixed"
        bottom={{ base: '16px', md: '20px' }}
        right={{ base: '16px', md: '20px' }}
        bg="blue.500"
        color="white"
        p={{ base: 3, md: 4 }}
        borderRadius="xl"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.3)"
        align="center"
        cursor="pointer"
        onClick={onOpen}
        zIndex={1000}
        _hover={{
          bg: 'blue.600',
          transform: 'translateY(-2px)',
          boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.4)',
        }}
        transition="all 0.2s ease"
        gap={2}
      >
        <Box position="relative">
          <Icon as={FaShoppingCart as React.ElementType} boxSize={{ base: 5, md: 6 }} />
          {totalItems > 0 && (
            <Box
              position="absolute"
              top="-8px"
              right="-8px"
              bg="red.500"
              color="white"
              borderRadius="full"
              w="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
              border="2px solid white"
            >
              {totalItems > 9 ? '9+' : totalItems}
            </Box>
          )}
        </Box>
        <VStack spacing={0} align="flex-start" display={{ base: 'none', sm: 'flex' }}>
          <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
            ₹{totalPrice}
          </Text>
          <Text fontSize="xs" opacity={0.9}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Text>
        </VStack>
        <Text display={{ base: 'block', sm: 'none' }} fontSize="md" fontWeight="bold">
          ₹{totalPrice}
        </Text>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <DrawerOverlay />
        <DrawerContent p={4} borderRadius={{ base: 0, md: 'md' }} boxShadow="lg" maxW={{ base: '100%', md: '400px' }}>
          <DrawerCloseButton />
          <DrawerHeader textAlign="center" fontSize="xl" fontWeight="bold">
            Cart Summary
            <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
              {totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{totalPrice}
            </Text>
          </DrawerHeader>
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
              <Text fontSize="sm" mb={1} fontWeight="semibold">
                Customer Name (Optional)
              </Text>
              <Input
                size="md"
                color={textColor}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter name"
                autoFocus={false}
              />
            </Box>
            <Box mt={3}>
              <Text fontSize="sm" mb={1} fontWeight="semibold">
                Mobile Number (Optional)
              </Text>
              <Input
                size="md"
                type="tel"
                value={mobileNumber}
                color={textColor}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
              />
            </Box>
            <Box mt={3}>
              <Text fontSize="sm" mb={1} fontWeight="semibold">
                Payment Mode
              </Text>
              <Select
                size="md"
                value={paymentMode}
                onChange={handlePaymentModeChange}
                color={textColor}
                fontWeight="semibold"
              >
                <option value="cash">💵 Cash</option>
                <option value="online">📱 Online (UPI/Card)</option>
              </Select>
            </Box>
            <Button
              mt={4}
              colorScheme="green"
              size="lg"
              w="full"
              onClick={handleCreateInvoice}
              isLoading={createInvoiceMutation.isPending}
              loadingText="Creating Invoice..."
              fontSize="md"
              fontWeight="bold"
              py={6}
            >
              💰 Create Invoice (₹{totalPrice})
            </Button>
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              Press Enter to checkout • Esc to close
            </Text>
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
