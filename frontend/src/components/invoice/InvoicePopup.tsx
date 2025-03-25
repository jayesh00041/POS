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
  Td,
  Thead,
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print';
import { formatDate } from 'shared';
import duplicateCopyImage from 'assets/img/layout/DuplicateCopy.jpg';

const InvoicePopup = ({
  invoice,
  isOpen,
  duplicateCopy,
  onClose,
}: {
  invoice: any;
  isOpen: boolean;
  duplicateCopy: boolean;
  onClose: () => void;
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = function (target) {
    console.log(window);
    return new Promise(() => {
      console.log("forwarding print request to the main process...");

      const data = target.contentWindow.document.documentElement.outerHTML;
      console.log(target.contentWindow.document.documentElement);
      //console.log(data);
      const blob = new Blob([data], {type: "text/html"});
      const url = URL.createObjectURL(blob);
      if((window as any)?.electronAPI)
        (window as any).electronAPI.printComponent({url}, (response) => {
          console.log("Main: ", response);
        });
      else if((window as any).ReactNativeWebView){
        const dataToPrint = {
          data: url,
          message: 'print-component',
        };
        (window as any).ReactNativeWebView.postMessage(JSON.stringify(dataToPrint));
      }
       
      //console.log('Main: ', data);
    });
  };

  const handleInvoicePrint = useReactToPrint({
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
    print: handlePrint,
  });

  if (!invoice) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            ref={printRef}
            color="black"
            bgImage={duplicateCopy ? `url(${duplicateCopyImage})` : 'none'}
            bgColor={!duplicateCopy ? 'white' : 'none'}
            bgRepeat="repeat-y"
            bgSize="contain"
            borderRadius="md" 
          >
            <Box borderRadius="md" boxShadow="lg" p={4}>
              {/* Business Header */}
              <Box textAlign="center" mb={4}>
                <Text fontSize="lg" fontWeight="bold">
                  Juicy Jalso
                </Text>
                <Text fontSize="sm">123 Business Street, City, Country</Text>
                <Text fontSize="sm">+91-8866886639</Text>
              </Box>

              {/* Customer Info */}
              <Divider borderColor="gray.800" my={3} />
              <Box mb={3} p={2} borderRadius="md">
                <Flex justify="space-between">
                  <Text fontSize="sm">{invoice.invoiceNumber}</Text>
                  <Text fontSize="sm">{formatDate(invoice.createdAt)}</Text>
                </Flex>

                <Text fontSize="sm">
                  <strong>Payment:</strong> {invoice.paymentMode}
                </Text>
              </Box>

              {/* Cart Items */}
              <Divider borderColor="gray.800" my={3} />
              <Box mb={4}>
                {invoice.cartItems.map((item: any) => (
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
              <Divider borderColor="gray.800" my={3} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total:</Text>
                <Text>₹{invoice.totalAmount}</Text>
              </Flex>

              {/* counter token numbers */}
              <Divider borderColor="gray.800" my={3} />
              <Table variant="unstyled" width="100%">
                <Thead>
                  <Tr>
                    <Td></Td>
                    <Td textAlign="end">Token Number</Td>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoice.counterWiseData.map((token, index) => (
                    <Tr key={token.counterNo || index}>
                      {' '}
                      {/* Ensure unique key */}
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
            {invoice.counterWiseData.map((counter, index) => (
              <Box
                key={counter.counterNo || index} // Unique key
                mt={4}
                className="page-break"
                borderRadius="md"
                boxShadow="lg"
                p={4}
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
                <Box mt={2} p={2} borderRadius="md">
                  {counter.items.map((item: any, idx: number) => (
                    <Box key={item.id || idx} p={2}>
                      {' '}
                      {/* Ensure unique key */}
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
                          {item.variations.map(
                            (variation: any, vIdx: number) => (
                              <Flex
                                key={variation._id || vIdx}
                                justify="space-between"
                                ml="8px"
                              >
                                <Text fontSize="xs" color="gray.500">
                                  {variation.name} x {variation.quantity}
                                </Text>
                              </Flex>
                            ),
                          )}
                        </>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Buttons */}
          <Flex justify="space-between" mt={4}>
            <Button onClick={onClose} colorScheme="gray">
              Close
            </Button>
            <Button onClick={() => handleInvoicePrint()} colorScheme="blue">
              Print
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoicePopup;
