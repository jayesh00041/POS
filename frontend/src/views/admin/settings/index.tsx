import React from 'react';
import {
  Box,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { MdPayments, MdPrint } from 'react-icons/md';
import PaymentSettings from './PaymentSettings';
import PrinterSettingsPage from './PrinterSettingsPage';
import BrandSettings from './BrandSettings';

export default function Settings() {
  const bgColor = useColorModeValue('white', 'navy.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const tabBg = useColorModeValue('rgba(66, 153, 225, 0.1)', 'rgba(66, 153, 225, 0.15)');
  const activeTextColor = useColorModeValue('brand.500', 'brand.400');


  return (
    <Flex direction="column" pt={{ base: '120px', md: '75px' }} pb="40px">
      {/* Header */}
      <Flex mb="30px" justifyContent="space-between" align="center" px={{ base: '20px', md: '40px' }}>
        <Flex direction="column">
          <Heading fontSize="32px" mb="4px" fontWeight="700" color={textColor}>
            Settings
          </Heading>
          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
            Manage your business settings and configurations
          </Text>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Box px={{ base: '20px', md: '40px' }}>
        <Box
          bg={bgColor}
          borderRadius="16px"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue(
            '0 4px 16px rgba(0, 0, 0, 0.04)',
            '0 4px 16px rgba(0, 0, 0, 0.2)'
          )}
          overflow="hidden"
        >
          <Tabs orientation="vertical" variant="unstyled" defaultIndex={0}>
            <Flex minH="600px">
              {/* Tab List - Sidebar */}
              <Box
                w={{ base: '100%', md: '240px' }}
                bg={useColorModeValue('gray.50', 'navy.800')}
                borderRight="1px solid"
                borderColor={borderColor}
                py="20px"
              >
                <TabList
                  display="flex"
                  flexDirection={{ base: 'row', md: 'column' }}
                  overflowX={{ base: 'auto', md: 'hidden' }}
                  px={{ base: '10px', md: '0px' }}
                  gap={{ base: '8px', md: '0px' }}
                >
                  <Tab
                    py="12px"
                    px="20px"
                    fontSize="sm"
                    fontWeight="500"
                    color={useColorModeValue('gray.600', 'gray.300')}
                    _selected={{
                      color: activeTextColor,
                      borderLeft: '3px solid',
                      borderColor: 'brand.500',
                      bg: tabBg,
                      fontWeight: '600',
                    }}
                    whiteSpace="nowrap"
                    borderRadius={{ base: '8px', md: '0px' }}
                    transition="all 0.3s ease"
                    display="flex"
                    alignItems="center"
                    gap="10px"
                  >
                    <Icon as={MdPayments as React.ElementType} w="18px" h="18px" />
                    <Text display={{ base: 'none', md: 'block' }}>Payments</Text>
                  </Tab>

                  <Tab
                    py="12px"
                    px="20px"
                    fontSize="sm"
                    fontWeight="500"
                    color={useColorModeValue('gray.600', 'gray.300')}
                    _selected={{
                      color: activeTextColor,
                      borderLeft: '3px solid',
                      borderColor: 'brand.500',
                      bg: tabBg,
                      fontWeight: '600',
                    }}
                    whiteSpace="nowrap"
                    borderRadius={{ base: '8px', md: '0px' }}
                    transition="all 0.3s ease"
                    display="flex"
                    alignItems="center"
                    gap="10px"
                  >
                    <Icon as={MdPrint as React.ElementType} w="18px" h="18px" />
                    <Text display={{ base: 'none', md: 'block' }}>Printer</Text>
                  </Tab>

                </TabList>
              </Box>

              {/* Tab Panels - Content */}
              <Box flex="1" overflow="auto">
                <TabPanels>
                  <TabPanel p={{ base: '20px', md: '40px' }}>
                    <PaymentSettings />
                  </TabPanel>

                  <TabPanel p={{ base: '20px', md: '40px' }}>
                    <PrinterSettingsPage />
                  </TabPanel>

                  <TabPanel p={{ base: '20px', md: '40px' }}>
                    <BrandSettings />
                  </TabPanel>
                </TabPanels>
              </Box>
            </Flex>
          </Tabs>
        </Box>
      </Box>
    </Flex>
  );
}
