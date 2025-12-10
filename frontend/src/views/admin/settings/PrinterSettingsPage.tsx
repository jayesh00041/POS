import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Text,
  useDisclosure,
  useColorModeValue,
  Switch,
  Badge,
  Icon,
  IconButton,
  HStack,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Stack,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import {
  getPrinters,
  addPrinter,
  updatePrinter,
  deletePrinter,
  setDefaultPrinter,
} from '../../../http-routes';

/* ================= Electron API ================= */
declare global {
  interface Window {
    electronAPI?: {
      testPrinter: (printerConfig: any) => Promise<{ status: string; message: string }>;
    };
  }
}

/* ================= Types ================= */
interface Printer {
  _id: string;
  name: string;
  type: 'thermal-80mm' | 'thermal-58mm' | 'standard-a4';
  deviceName: string;
  isDefault: boolean;
  silent: boolean;
  printBackground: boolean;
  color: boolean;
  copies: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  type: 'thermal-80mm' | 'thermal-58mm' | 'standard-a4';
  deviceName: string;
  silent: boolean;
  printBackground: boolean;
  color: boolean;
  copies: number;
}

/* ================= Component ================= */
const PrinterSettingsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'thermal-80mm',
    deviceName: '',
    silent: true,
    printBackground: false,
    color: false,
    copies: 1,
  });

  /* ================= Query ================= */
  const { data, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['printers'],
    queryFn: async () => (await getPrinters()).data.data,
  });

  const printers: Printer[] = data?.printers || [];

  /* ================= Mutations ================= */
  const printerMutation = useMutation({
    mutationFn: isEditMode && selectedPrinter
      ? (payload: FormData) => updatePrinter(selectedPrinter._id, payload)
      : (payload: FormData) => addPrinter(payload),
    onSuccess: () => {
      enqueueSnackbar(isEditMode ? 'Printer updated successfully' : 'Printer added successfully', {
        variant: 'success',
      });
      refetch();
      onClose();
      resetForm();
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || 'Operation failed', {
        variant: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePrinter,
    onSuccess: () => {
      enqueueSnackbar('Printer deleted successfully', { variant: 'success' });
      refetch();
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultPrinter,
    onSuccess: () => {
      enqueueSnackbar('Default printer set successfully', { variant: 'success' });
      refetch();
    },
  });

  const testPrinterMutation = useMutation({
    mutationFn: async (printer: Printer) => {
      if (!window.electronAPI?.testPrinter) {
        throw new Error('Electron environment required');
      }
      return window.electronAPI.testPrinter(printer);
    },
    onSuccess: (res: any) =>
      enqueueSnackbar(res.message, {
        variant: res.status === 'success' ? 'success' : 'error',
      }),
  });

  /* ================= Helpers ================= */
  const resetForm = () => {
    setIsEditMode(false);
    setSelectedPrinter(null);
    setFormData({
      name: '',
      type: 'thermal-80mm',
      deviceName: '',
      silent: true,
      printBackground: false,
      color: false,
      copies: 1,
    });
  };

  const handleInputChange = (e: any) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEdit = (printer: Printer) => {
    setIsEditMode(true);
    setSelectedPrinter(printer);
    setFormData(printer);
    onOpen();
  };

  if (isLoading) return <Spinner />;

  /* ================= Render ================= */
  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        mb={6}
      >
        <Box>
          <Heading size="md">Printer Management</Heading>
          <Text fontSize="sm" color="gray.500">
            Configure and manage printing devices
          </Text>
        </Box>

        <Button
          leftIcon={<Icon as={FiPlus as React.ElementType} />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Add Printer
        </Button>
      </Flex>

      {isError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {(error as Error).message}
        </Alert>
      )}

      {/* Cards */}
      <Stack spacing={4}>
        {printers.map(printer => (
          <Card
            key={printer._id}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <Flex justify="space-between">
                <Box>
                  <Heading size="sm">{printer.name}</Heading>
                  <Text fontSize="xs" color="gray.500">
                    {printer.deviceName}
                  </Text>
                </Box>
                <Badge colorScheme={printer.isActive ? 'green' : 'red'}>
                  {printer.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </Flex>

              <Divider my={3} />

              <HStack wrap="wrap" spacing={2}>
                <Badge>{printer.type}</Badge>
                <Badge colorScheme={printer.silent ? 'green' : 'red'}>Silent</Badge>
                <Badge colorScheme={printer.printBackground ? 'green' : 'red'}>BG</Badge>
                <Badge colorScheme={printer.color ? 'green' : 'red'}>Color</Badge>
                <Badge>Copies: {printer.copies}</Badge>
              </HStack>

              <Divider my={3} />

              <Flex justify="space-between" align="center">
                {printer.isDefault ? (
                  <Badge colorScheme="purple">DEFAULT</Badge>
                ) : (
                  <Button
                    size="xs"
                    leftIcon={<Icon as={FiCheck as React.ElementType} />}
                    onClick={() => setDefaultMutation.mutate(printer._id)}
                  >
                    Set Default
                  </Button>
                )}

                <HStack>
                  <Tooltip label="Test Printer">
                    <IconButton
                      aria-label="Test Printer"
                      icon={<Icon as={FiCheck as React.ElementType} />}
                      size="sm"
                      onClick={() => testPrinterMutation.mutate(printer)}
                    />
                  </Tooltip>

                  <IconButton
                    aria-label="Edit Printer"
                    icon={<Icon as={FiEdit as React.ElementType} />}
                    size="sm"
                    onClick={() => handleEdit(printer)}
                  />

                  <IconButton
                    aria-label="Delete Printer"
                    icon={<Icon as={FiTrash2 as React.ElementType} />}
                    size="sm"
                    colorScheme="red"
                    isDisabled={printer.isDefault}
                    onClick={() => deleteMutation.mutate(printer._id)}
                  />
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </Stack>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Edit Printer' : 'Add Printer'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid gap={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Device Name</FormLabel>
                <Input
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="thermal-80mm">Thermal 80mm</option>
                  <option value="thermal-58mm">Thermal 58mm</option>
                  <option value="standard-a4">Standard A4</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Copies</FormLabel>
                <Input type="number" name="copies" value={formData.copies} onChange={handleInputChange} />
              </FormControl>

              <FormControl display="flex" justifyContent="space-between">
                <FormLabel>Silent</FormLabel>
                <Switch name="silent" isChecked={formData.silent} onChange={handleInputChange} />
              </FormControl>

              <FormControl display="flex" justifyContent="space-between">
                <FormLabel>Print Background</FormLabel>
                <Switch
                  name="printBackground"
                  isChecked={formData.printBackground}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl display="flex" justifyContent="space-between">
                <FormLabel>Color</FormLabel>
                <Switch name="color" isChecked={formData.color} onChange={handleInputChange} />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => printerMutation.mutate(formData)}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PrinterSettingsPage;
