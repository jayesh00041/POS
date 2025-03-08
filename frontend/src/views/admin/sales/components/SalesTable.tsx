import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
  Icon,
  Box,
  Text,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import { FaCalendar, FaEye } from 'react-icons/fa';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { getSalesData } from 'http-routes';
import MiniCalendar from 'components/calendar/MiniCalendar';
import { formatDate } from 'shared';
import InvoicePopup from 'components/invoice/InvoicePopup';

const SalesTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [showInvoice, setShowInvoice] = useState(false);

  const getSalesDataMutation = useMutation({
    mutationFn: (selectedDate: any[]) =>
      getSalesData(selectedDate[0], selectedDate[1]),
    onSuccess: (data: any) => {
      setInvoices(data.data.data);
    },
    onError: (error) => {
      enqueueSnackbar('Error fetching sales data', { variant: 'error' });
    },
  });

  useEffect(() => {
    getSalesDataMutation.mutate([selectedDate.startDate, selectedDate.endDate]);
    // eslint-disable-next-line
  }, [selectedDate]);

  useEffect(() => {
    setFilteredInvoices(
      invoices.filter((invoice) =>
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, invoices]);

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  function handdleDateChange(date: Date | [Date, Date]) {
    setSelectedDate({ startDate: date[0], endDate: date[1] });
  }

  return (
    <Box>
      <Flex alignItems="center" justify="space-between" gap="10px">
        <SearchBar
          placeholder="Search Customer"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button
              colorScheme="brand"
              height="50px"
              width="50px"
              borderRadius="50%"
            >
              <Icon as={FaCalendar as React.ElementType} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <MiniCalendar
                selectRange={true}
                maxDate={new Date()}
                onDateChange={(date) => {
                  handdleDateChange(date);
                }}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>

      <TableContainer overflowY="auto" maxH="calc(100vh - 196px)">
        {getSalesDataMutation.isPending ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : filteredInvoices.length === 0 ? (
          <Flex justify="center" align="center" height="200px">
            <Text fontSize="lg" color="gray.500">
              No invoices found.
            </Text>
          </Flex>
        ) : (
          <Table variant="striped">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                <Th>Invoice No.</Th>
                <Th>Customer Name</Th>
                <Th>Payment Mode</Th>
                <Th>Date Time</Th>
                <Th>Amount</Th>
                <Th>Biller</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInvoices.map((invoice) => (
                <Tr key={invoice._id}>
                  <Td>{invoice.invoiceNumber}</Td>
                  <Td>{invoice.customerName || '-'}</Td>
                  <Td>
                    {invoice.paymentMode}{' '}
                    {invoice.referenceNumber !== '' &&
                      `(${invoice.referenceNumber})`}
                  </Td>
                  <Td>{formatDate(invoice.createdAt)}</Td>
                  <Td>₹{invoice.totalAmount}</Td>
                  <Td>{invoice.createdBy.name}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleView(invoice)}
                    >
                      <Icon
                        as={FaEye as React.ElementType}
                        width="15px"
                        height="15px"
                      />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Invoice Details Modal */}

      <InvoicePopup
        isOpen={showInvoice}
        invoice={selectedInvoice}
        duplicateCopy={true}
        onClose={() => setShowInvoice(false)}
      />
    </Box>
  );
};

export default SalesTable;
