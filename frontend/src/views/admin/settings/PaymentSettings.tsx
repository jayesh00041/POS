import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  useColorModeValue,
  useToast,
  Switch,
  Radio,
  RadioGroup,
  Stack,
  IconButton,
  Icon,
  Badge,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { MdDelete, MdAdd } from 'react-icons/md';
import { getPaymentSettings, updatePaymentSettings, addUpiAccount, removeUpiAccount, setDefaultUpi } from '../../../http-routes';

interface UPIAccount {
  id: string;
  upiId: string;
  businessName: string;
}

export default function PaymentSettings() {
  const bgColor = useColorModeValue('gray.50', 'navy.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBgColor = useColorModeValue('white', 'navy.700');
  const hoverBgColor = useColorModeValue('gray.100', 'navy.600');
  const emptyBgColor = useColorModeValue('gray.100', 'navy.600');
  const emptyTextColor = useColorModeValue('gray.600', 'gray.400');
  const hintTextColor = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const [paymentSettings, setPaymentSettings] = useState({
    _id: '',
    enableCash: true,
    enableUpi: true,
    upiAccounts: [] as UPIAccount[],
    defaultUpiId: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [originalSettings, setOriginalSettings] = useState(paymentSettings);

  // Load payment settings from API
  const loadPaymentSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getPaymentSettings();
      const data = response.data.data || response.data;
      setPaymentSettings(data);
      setOriginalSettings(data);
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error loading payment settings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load payment settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentSettings();
  });

  const handleAddUPI = async () => {
    if (!newUpiId.trim() || !newBusinessName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both UPI ID and business name',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      // Backend will generate the ID automatically
      const response = await addUpiAccount({
        upiId: newUpiId.trim(),
        businessName: newBusinessName.trim(),
      });
      const updatedData = response.data.data || response.data;
      setPaymentSettings(updatedData);
      setOriginalSettings(updatedData);
      setNewUpiId('');
      setNewBusinessName('');
      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'UPI account added successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error adding UPI account:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add UPI account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUPI = async (id: string) => {
    try {
      setIsSaving(true);
      const response = await removeUpiAccount(id);
      const updatedData = response.data.data || response.data;
      setPaymentSettings(updatedData);
      setOriginalSettings(updatedData);
      setHasChanges(false);
      toast({
        title: 'Deleted',
        description: 'UPI account removed successfully',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error deleting UPI account:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove UPI account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setIsSaving(true);
      const response = await setDefaultUpi({ upiId: id });
      const updatedData = response.data.data || response.data;
      setPaymentSettings(updatedData);
      setOriginalSettings(updatedData);
      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Default UPI updated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error setting default UPI:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to set default UPI',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack spacing="24px" align="stretch">
      {/* Loading State */}
      {isLoading && (
        <Center minH="300px">
          <Spinner size="lg" color="brand.500" thickness="4px" />
        </Center>
      )}

      {!isLoading && (
        <>
          {/* Payment Methods Toggle */}
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={textColor}>
                Payment Methods
              </Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing="16px" align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="600" color={textColor} mb="4px">
                      Cash Payment
                    </Text>
                    <Text fontSize="sm" color={hintTextColor}>
                      Enable/disable cash payments
                    </Text>
                  </Box>
                  <Switch
                    isChecked={paymentSettings.enableCash}
                    onChange={async (e) => {
                      try {
                        setIsSaving(true);
                        const response = await updatePaymentSettings({
                          enableCash: e.target.checked,
                          enableUpi: paymentSettings.enableUpi,
                        });
                        const updatedData = response.data.data || response.data;
                        setPaymentSettings(updatedData);
                        setOriginalSettings(updatedData);
                        setHasChanges(false);
                      } catch (error: any) {
                        console.error('Error updating cash payment:', error);
                        toast({
                          title: 'Error',
                          description: error.response?.data?.message || 'Failed to update payment settings',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    isDisabled={isSaving}
                  />
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="600" color={textColor} mb="4px">
                      UPI Payment
                    </Text>
                    <Text fontSize="sm" color={hintTextColor}>
                      Enable/disable UPI payments
                    </Text>
                  </Box>
                  <Switch
                    isChecked={paymentSettings.enableUpi}
                    onChange={async (e) => {
                      try {
                        setIsSaving(true);
                        const response = await updatePaymentSettings({
                          enableCash: paymentSettings.enableCash,
                          enableUpi: e.target.checked,
                        });
                        const updatedData = response.data.data || response.data;
                        setPaymentSettings(updatedData);
                        setOriginalSettings(updatedData);
                        setHasChanges(false);
                      } catch (error: any) {
                        console.error('Error updating UPI payment:', error);
                        toast({
                          title: 'Error',
                          description: error.response?.data?.message || 'Failed to update payment settings',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    isDisabled={isSaving}
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* UPI Accounts Management */}
          {paymentSettings.enableUpi && (
            <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md" color={textColor}>
                  UPI Accounts
                </Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing="20px" align="stretch">
                  {/* Add New UPI Account */}
                  <Box>
                    <Text fontWeight="600" color={textColor} mb="12px" fontSize="sm">
                      Add New UPI Account
                    </Text>
                    <VStack spacing="12px" align="stretch">
                      <FormControl>
                        <FormLabel color={textColor} fontWeight="500" fontSize="sm" mb="6px">
                          UPI ID
                        </FormLabel>
                        <Input
                          placeholder="e.g., yourname@googleplay"
                          value={newUpiId}
                          onChange={(e) => setNewUpiId(e.target.value)}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500' }}
                          size="sm"
                          isDisabled={isSaving}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color={textColor} fontWeight="500" fontSize="sm" mb="6px">
                          Business Name
                        </FormLabel>
                        <Input
                          placeholder="e.g., My Store"
                          value={newBusinessName}
                          onChange={(e) => setNewBusinessName(e.target.value)}
                          borderColor={borderColor}
                          _focus={{ borderColor: 'brand.500' }}
                          size="sm"
                          isDisabled={isSaving}
                        />
                      </FormControl>

                      <Button
                        leftIcon={<Icon as={MdAdd as React.ElementType} />}
                        colorScheme="blue"
                        size="sm"
                        onClick={handleAddUPI}
                        w="full"
                        isLoading={isSaving}
                      >
                        Add UPI Account
                      </Button>
                    </VStack>
                  </Box>

                  {paymentSettings.upiAccounts.length > 0 && (
                    <>
                      <Divider />

                      {/* List of UPI Accounts */}
                      <Box>
                        <Text fontWeight="600" color={textColor} mb="12px" fontSize="sm">
                          Your UPI Accounts ({paymentSettings.upiAccounts.length})
                        </Text>

                        <RadioGroup
                          value={paymentSettings.defaultUpiId}
                          onChange={handleSetDefault}
                        >
                          <Stack spacing="12px">
                            {paymentSettings.upiAccounts.map((account) => (
                              <Box
                                key={account.upiId}
                                bg={cardBgColor}
                                p="14px"
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={borderColor}
                                transition="all 0.2s"
                                _hover={{ bg: hoverBgColor }}
                              >
                                <Flex justify="space-between" align="start" gap="12px">
                                  <Flex align="center" gap="12px" flex="1">
                                    <Radio value={account.upiId} isDisabled={isSaving} />
                                    <Box flex="1">
                                      <Text fontWeight="600" color={textColor} fontSize="sm">
                                        {account.businessName}
                                      </Text>
                                      <Text fontSize="xs" color={hintTextColor}>
                                        {account.upiId}
                                      </Text>
                                    </Box>
                                    {paymentSettings.defaultUpiId === account.id && (
                                      <Badge colorScheme="green" fontSize="xs">
                                        Default
                                      </Badge>
                                    )}
                                  </Flex>

                                  <IconButton
                                    aria-label="Delete UPI"
                                    icon={<Icon as={MdDelete as React.ElementType} />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleDeleteUPI(account.id)}
                                    isDisabled={
                                      paymentSettings.upiAccounts.length === 1 || isSaving
                                    }
                                  />
                                </Flex>
                              </Box>
                            ))}
                          </Stack>
                        </RadioGroup>
                      </Box>
                    </>
                  )}

                  {paymentSettings.upiAccounts.length === 0 && (
                    <Box
                      textAlign="center"
                      py="20px"
                      borderRadius="8px"
                      bg={emptyBgColor}
                    >
                      <Text color={emptyTextColor} fontSize="sm">
                        No UPI accounts added yet. Add one to get started.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Save Button */}
          <HStack justify="flex-end" spacing="12px">
            <Button
              variant="ghost"
              onClick={() => {
                setPaymentSettings(originalSettings);
                setNewUpiId('');
                setNewBusinessName('');
                setHasChanges(false);
              }}
              isDisabled={!hasChanges && !isSaving}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={isSaving}
              isDisabled={!hasChanges}
              onClick={async () => {
                setIsSaving(true);
                try {
                  const response = await updatePaymentSettings({
                    enableCash: paymentSettings.enableCash,
                    enableUpi: paymentSettings.enableUpi,
                  });
                  const updatedData = response.data.data || response.data;
                  setPaymentSettings(updatedData);
                  setOriginalSettings(updatedData);
                  toast({
                    title: 'Success',
                    description: 'Payment settings updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  setHasChanges(false);
                } catch (error: any) {
                  console.error('Error saving payment settings:', error);
                  toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to update payment settings',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              Save Changes
            </Button>
          </HStack>
        </>
      )}
    </VStack>
  );
}
