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
  Select,
  Switch,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { MdPrint } from 'react-icons/md';

export default function PrinterSettings() {
  const bgColor = useColorModeValue('gray.50', 'navy.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();

  const [printerSettings, setPrinterSettings] = useState({
    printerName: '',
    printerModel: '',
    paperSize: '58mm',
    printQuality: 'normal',
    paperWidth: '58',
    marginLeft: '2',
    marginRight: '2',
    autoprint: false,
    printFooter: true,
    footerText: 'Thank you for your purchase!',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load printer settings from API/localStorage
    const savedSettings = localStorage.getItem('printerSettings');
    if (savedSettings) {
      setPrinterSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    setPrinterSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // API call would go here
      // await updatePrinterSettings(printerSettings);
      localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
      toast({
        title: 'Success',
        description: 'Printer settings updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update printer settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPrint = async () => {
    try {
      toast({
        title: 'Test Print',
        description: 'Sending test print to printer...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      // API call would go here
      // await testPrinter(printerSettings);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test print',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing="24px" align="stretch">
      {/* Printer Connection */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Printer Connection
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
            <FormControl>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Printer Name
              </FormLabel>
              <Input
                placeholder="e.g., Receipt Printer"
                value={printerSettings.printerName}
                onChange={(e) => handleChange('printerName', e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: 'brand.500' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Printer Model
              </FormLabel>
              <Input
                placeholder="e.g., Epson TM-M30"
                value={printerSettings.printerModel}
                onChange={(e) => handleChange('printerModel', e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: 'brand.500' }}
              />
            </FormControl>
          </Grid>
        </CardBody>
      </Card>

      {/* Paper Configuration */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Paper Configuration
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack spacing="16px" align="stretch">
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Paper Size
                </FormLabel>
                <Select
                  value={printerSettings.paperSize}
                  onChange={(e) => handleChange('paperSize', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                >
                  <option value="58mm">58mm (Thermal)</option>
                  <option value="80mm">80mm (Thermal)</option>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="Letter">Letter</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Print Quality
                </FormLabel>
                <Select
                  value={printerSettings.printQuality}
                  onChange={(e) => handleChange('printQuality', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                >
                  <option value="draft">Draft</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap="20px">
              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Paper Width (mm)
                </FormLabel>
                <Input
                  type="number"
                  value={printerSettings.paperWidth}
                  onChange={(e) => handleChange('paperWidth', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Left Margin (mm)
                </FormLabel>
                <Input
                  type="number"
                  value={printerSettings.marginLeft}
                  onChange={(e) => handleChange('marginLeft', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Right Margin (mm)
                </FormLabel>
                <Input
                  type="number"
                  value={printerSettings.marginRight}
                  onChange={(e) => handleChange('marginRight', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Print Settings */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Print Settings
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack spacing="16px" align="stretch">
            <HStack justify="space-between">
              <Box>
                <Text fontWeight="600" color={textColor} mb="4px">
                  Auto Print
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Automatically print after checkout
                </Text>
              </Box>
              <Switch
                isChecked={printerSettings.autoprint}
                onChange={(e) => handleChange('autoprint', e.target.checked)}
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <Box>
                <Text fontWeight="600" color={textColor} mb="4px">
                  Print Footer
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Print footer message on receipts
                </Text>
              </Box>
              <Switch
                isChecked={printerSettings.printFooter}
                onChange={(e) => handleChange('printFooter', e.target.checked)}
              />
            </HStack>

            {printerSettings.printFooter && (
              <>
                <Divider />
                <FormControl>
                  <FormLabel color={textColor} fontWeight="600" mb="8px">
                    Footer Text
                  </FormLabel>
                  <Input
                    placeholder="Enter footer message"
                    value={printerSettings.footerText}
                    onChange={(e) => handleChange('footerText', e.target.value)}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'brand.500' }}
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <HStack justify="flex-end" spacing="12px">
        <Button
          leftIcon={<Icon as={MdPrint as React.ElementType} />}
          variant="outline"
          onClick={handleTestPrint}
        >
          Test Print
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const savedSettings = localStorage.getItem('printerSettings');
            if (savedSettings) {
              setPrinterSettings(JSON.parse(savedSettings));
              setHasChanges(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          isLoading={isLoading}
          isDisabled={!hasChanges}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </HStack>
    </VStack>
  );
}
