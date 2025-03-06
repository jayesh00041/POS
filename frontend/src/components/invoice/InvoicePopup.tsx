import React, { useRef } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Table,
  Tr,
  Tbody,
  Td
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print';

const InvoicePopup = ({
  invoice,
  onClose,
}: {
  invoice: any;
  onClose: () => void;
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page {
        size: 80mm auto; /* Set paper width to 80mm */
        margin: 0; /* Remove default margins */
      }
      @media print {
        body { margin: 0; } /* Ensure no extra margins */
        .page-break { page-break-before: always; } /* Force page break for tokens */
      }
    `,
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);

    const options = { timeZone: 'Asia/Kolkata' };
    const day = date.toLocaleString('en-IN', { day: '2-digit', ...options });
    const month = date.toLocaleString('en-IN', {
      month: '2-digit',
      ...options,
    });
    const year = date.toLocaleString('en-IN', { year: 'numeric', ...options });

    let hours = date
      .toLocaleString('en-IN', { hour: '2-digit', hour12: true, ...options })
      .split(' ')[0];
    let minutes = date.toLocaleString('en-IN', {
      minute: '2-digit',
      ...options,
    });
    let ampm = date
      .toLocaleString('en-IN', { hour: '2-digit', hour12: true, ...options })
      .split(' ')[1]
      .toLowerCase();

    return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box ref={printRef}>
            <Box borderRadius="md" boxShadow="lg" p={4} bg="white">
              {/* Business Header */}
              <Box textAlign="center" mb={4}>
                <Text fontSize="lg" fontWeight="bold">
                  Juicy Jalso
                </Text>
                <Text fontSize="sm">123 Business Street, City, Country</Text>
                <Text fontSize="sm">+91-8866886639</Text>
              </Box>

              {/* Customer Info */}
              <Box mb={3} p={2} bg="gray.100" borderRadius="md">
                <Flex justify="space-between">
                  <Text fontSize="sm">{invoice.invoice.invoiceNumber}</Text>
                  <Text fontSize="sm">
                    {formatDate(invoice.invoice.createdAt)}
                  </Text>
                </Flex>

                <Text fontSize="sm">
                  <strong>Payment:</strong> {invoice.invoice.paymentMode}
                </Text>
              </Box>

              {/* Cart Items */}
              <Box mb={4}>
                {invoice.invoice.cartItems.map((item: any) => (
                  <Box key={item.id} p={2}>
                    {item.variations.length === 1 &&
                    item.variations[0].name === 'Default' ? (
                      <Flex justify="space-between">
                        <Text fontSize="sm" fontWeight="bold">
                          {item.productName} x {item.totalQuantity}
                        </Text>
                        <Text fontSize="sm">₹{item.total}</Text>
                      </Flex>
                    ) : (
                      <>
                        <Text fontSize="sm" fontWeight="bold">
                          {item.productName}
                        </Text>
                        {item.variations.map((variation: any) => (
                          <Flex
                            key={variation._id}
                            justify="space-between"
                            ml="8px"
                          >
                            <Text fontSize="xs" color="gray.500">
                              {variation.name} x {variation.quantity}
                            </Text>
                            <Text fontSize="sm">₹{variation.total}</Text>
                          </Flex>
                        ))}
                      </>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Total Amount */}
              <Divider my={3} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total:</Text>
                <Text>₹{invoice.invoice.totalAmount}</Text>
              </Flex>

              {/* counter token numbers */}
              <Divider my={3} />
              <Table variant="unstyled" width="100%">
                <Tbody>
                  {Object.values(
                    invoice.counterToken as Record<string, any>,
                  ).map((token) => (
                    <Tr key={token.counterNo}>
                      <Td fontSize="sm" padding="2px">
                        Counter Number: {token.counterNo}
                      </Td>
                      <Td padding="2px" textAlign="right">
                        <Box
                          border="1px solid"
                          borderRadius="50%"
                          width="25px"
                          height="25px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="sm"
                          fontWeight="bold"
                          marginLeft="auto"
                        >
                          {token.counterTokenNumber}
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* footer */}
              <Text fontSize="xs" textAlign="center">
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              </Text>
              <Text fontSize="sm" textAlign="center">
                Your taste buds will miss us! Visit again!
              </Text>
            </Box>

            {/* Counter Token  */}
            {Object.values(invoice.counterToken as Record<string, any>).map(
              (counter: any) => (
                <Box
                  key={counter.counterNo}
                  mt={4}
                  className="page-break"
                  borderRadius="md"
                  boxShadow="lg"
                  p={4}
                  bg="white"
                >
                  <Flex justifyContent="space-between">
                    <Text fontSize="sm" fontWeight="bold">
                      Counter: {counter.counterNo}
                    </Text>
                    <Box
                      border="1px"
                      borderRadius="50%"
                      width="35px"
                      height="35px"
                      fontSize="xl"
                      textAlign="center"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {counter.counterTokenNumber}
                    </Box>
                  </Flex>
                  <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                    {counter.items.map((item: any, idx: number) => (
                      <Box key={item.id} p={2}>
                        {item.variations.length === 1 &&
                        item.variations[0].name === 'Default' ? (
                          <Flex justify="space-between">
                            <Text fontSize="sm" fontWeight="bold">
                              {item.productName} x {item.totalQuantity}
                            </Text>
                          </Flex>
                        ) : (
                          <>
                            <Text fontSize="sm" fontWeight="bold">
                              {item.productName}
                            </Text>
                            {item.variations.map((variation: any) => (
                              <Flex
                                key={variation._id}
                                justify="space-between"
                                ml="8px"
                              >
                                <Text fontSize="xs" color="gray.500">
                                  {variation.name} x {variation.quantity}
                                </Text>
                              </Flex>
                            ))}
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ),
            )}
          </Box>

          {/* Buttons */}
          <Flex justify="space-between" mt={4}>
            <Button onClick={onClose} colorScheme="gray">
              Close
            </Button>
            <Button onClick={() => handlePrint()} colorScheme="blue">
              Print
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoicePopup;
