import React, { useRef, useState, useEffect } from 'react';
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
  Spinner,
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print';
import { formatDate } from 'shared';
import { enqueueSnackbar } from 'notistack';
import duplicateCopyImage from 'assets/img/layout/DuplicateCopy.jpg';

const InvoicePopup = ({
  invoice,
  isOpen,
  duplicateCopy,
  onClose,
  printerConfig,
}: {
  invoice: any;
  isOpen: boolean;
  duplicateCopy: boolean;
  onClose: () => void;
  printerConfig?: any;
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Setup Electron print result listener
  useEffect(() => {
    if ((window as any)?.electronAPI) {
      const handlePrintResult = (result: any) => {
        setIsPrinting(false);
        if (result.status === "success") {
          enqueueSnackbar("Receipt printed successfully!", { variant: "success" });
        } else {
          enqueueSnackbar(`Print failed: ${result.message}`, { variant: "error" });
        }
      };

      // Listen for print results from main process
      (window as any).ipcRenderer?.on("print-result", handlePrintResult);
      
      return () => {
        (window as any).ipcRenderer?.removeListener("print-result", handlePrintResult);
      };
    }
  }, []);

  const handlePrint = function (target) {
    return new Promise<void>((resolve) => {
      try {
        setIsPrinting(true);

        // Extract invoice HTML from iframe
        const htmlContent = target.contentWindow.document.documentElement.outerHTML;

        // Detect platform and call appropriate API
        if ((window as any)?.electronAPI) {
          // Desktop: Electron with dynamic printer config
          (window as any).electronAPI.printComponent(
            {
              htmlContent, // Send HTML content directly instead of blob URL
              printerConfig: printerConfig || null,
            },
            (response: any) => {
              // Success or failure handled by print-result listener
              resolve();
            }
          );
        } else if ((window as any)?.ReactNativeWebView) {
          // Mobile: React Native Webview
          const dataToPrint = {
            data: htmlContent,
            message: "print-component",
            printerConfig: printerConfig || null,
          };
          (window as any).ReactNativeWebView.postMessage(JSON.stringify(dataToPrint));
          setIsPrinting(false);
          enqueueSnackbar("Print request sent to mobile app", { variant: "info" });
          resolve();
        } else {
          // Fallback: Browser print dialog
          setIsPrinting(false);
          enqueueSnackbar("No print API available. Using browser print.", { variant: "warning" });
          window.print();
          resolve();
        }
      } catch (error: any) {
        setIsPrinting(false);
        const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
        enqueueSnackbar(`Error: ${errorMessage}`, { variant: "error" });
        resolve();
      }
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
                  Vadodara Ponk Carnival
                </Text>
                <Text fontSize="sm"> जैसी वेज मंचूरियन ग्रेवी वाली | Nilamber Circle, Opp Empire Edge, Gotri-Bhayli Road, Vadodara, Gujarat, India 390007</Text>
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
            <Button onClick={onClose} colorScheme="gray" isDisabled={isPrinting}>
              Close
            </Button>
            <Button 
              onClick={() => handleInvoicePrint()} 
              colorScheme="blue"
              isLoading={isPrinting}
              loadingText="Printing..."
            >
              {isPrinting ? (
                <>
                  <Spinner size="sm" mr={2} />
                  Printing...
                </>
              ) : (
                "Print"
              )}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoicePopup;
