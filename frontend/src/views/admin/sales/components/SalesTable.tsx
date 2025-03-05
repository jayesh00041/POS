import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Tooltip,
  Icon,
  Box,
  Text,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaEye } from "react-icons/fa";
import { SearchBar } from "components/navbar/searchBar/SearchBar";

const SalesTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetch(process.env.GET_SALES_API || "https://mocki.io/v1/10ac14ae-503d-40f4-b606-eab0d6d93db9")
      .then((response) => response.json())
      .then((data) => {
        setInvoices(data);
        setFilteredInvoices(data);
      })
      .catch((error) => console.error("Error fetching invoices:", error));
  }, []);

  useEffect(() => {
    setFilteredInvoices(
      invoices.filter((invoice) =>
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, invoices]);

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  return (
    <Box>
      <Flex alignItems="center" justify="space-between" gap="10px">
        <SearchBar
          placeholder="Search Customer"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Flex>

      <TableContainer overflowY="auto" maxH="calc(100vh - 196px)">
        <Table variant="striped">
          <Thead position="sticky" top={0} bg="white" zIndex={1}>
            <Tr>
              <Th>Products</Th>
              <Th>Invoice No.</Th>
              <Th>Amount</Th>
              <Th>Payment Mode</Th>
              <Th>Customer Name</Th>
              <Th>Invoice Type</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredInvoices.map((invoice) => (
              <Tr key={invoice.id}>
                <Td>
                  <Flex>
                    {invoice.products.slice(0, 3).map((product, index) => (
                      <Avatar
                        key={index}
                        size="sm"
                        name={product.name}
                        src={product.imageUrl || ""}
                        ml={index > 0 ? -2 : 0}
                      />
                    ))}
                    {invoice.products.length > 3 && (
                      <Text ml={2}>+{invoice.products.length - 3}</Text>
                    )}
                  </Flex>
                </Td>
                <Td>{invoice.invoiceId}</Td>
                <Td>₹{invoice.amount}</Td>
                <Td>{invoice.paymentMode}</Td>
                <Td>{invoice.customerName}</Td>
                <Td>
                  <Text
                    fontWeight="bold"
                    color={invoice.invoiceType === "Sale" ? "green.500" : "red.500"}
                  >
                    {invoice.invoiceType}
                  </Text>
                </Td>
                <Td>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleView(invoice)}
                  >
                    <Icon as={FaEye as React.ElementType} width="15px" height="15px" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Invoice Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInvoice && (
              <>
                <Text><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</Text>
                <Text><strong>Customer Name:</strong> {selectedInvoice.customerName}</Text>
                <Text><strong>Amount:</strong> ₹{selectedInvoice.amount}</Text>
                <Text><strong>Payment Mode:</strong> {selectedInvoice.paymentMode}</Text>
                <Text><strong>Invoice Type:</strong> {selectedInvoice.type}</Text>
                <Text><strong>Products:</strong></Text>
                {selectedInvoice.products.map((product: any, index: number) => (
                  <Flex key={index} alignItems="center" mt={2}>
                    <Avatar size="sm" src={product.imageUrl || ""} mr={2} />
                    <Text>{product.name}</Text>
                  </Flex>
                ))}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SalesTable;
