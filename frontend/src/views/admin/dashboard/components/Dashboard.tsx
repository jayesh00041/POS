import { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  SimpleGrid,
  Flex,
  useColorModeValue,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FaShoppingCart, FaRupeeSign } from 'react-icons/fa';
import { MdDateRange } from 'react-icons/md';
import Filters from './Filters';
import EnhancedChart from './EnhancedChart';
import SummaryCard from './SummaryCard';
import { getSalesOverview } from '../../../../http-routes/index';
import { useMutation } from '@tanstack/react-query';

const Dashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Calculate default dates
  const today = new Date();
  const fifteenDaysAgo = new Date(today);
  fifteenDaysAgo.setDate(today.getDate() - 15);

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const [filters, setFilters] = useState({
    userId: 'all',
    startDate: formatDate(fifteenDaysAgo),
    endDate: formatDate(today),
    period: 'daily',
  });
  const [salesData, setSalesData] = useState(null);
  const [dataType, setDataType] = useState<'sales' | 'revenue'>('sales');

  const dataMutation = useMutation({
    mutationFn: async () => {
      const response = await getSalesOverview(filters.startDate, filters.endDate, filters.period, filters.userId);
      return response;
    },
    onSuccess: (res) => {
      setSalesData(res.data);
    },
    onError: (error) => {
      console.error('Error fetching data:', error);
    },
  });

  useEffect(() => {
    dataMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onClose(); // Close the popup after applying filters
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const filterBg = useColorModeValue('gray.50', 'gray.700');

  // Calculate average order value
  const averageOrderValue = salesData?.totalOrders > 0
    ? Math.round(salesData.totalRevenue / salesData.totalOrders)
    : 0;

  // Loading State
  if (dataMutation.isPending) {
    return (
      <VStack spacing={6} align="stretch" p={{ base: 4, md: 6 }}>
        {/* Filter Section Skeleton */}
        <Box p={4} borderWidth="1px" borderRadius="xl" bg={cardBg}>
          <Skeleton height="40px" />
        </Box>

        {/* Summary Cards Skeleton */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
          {[1, 2, 3].map((i) => (
            <Box key={i} p={6} borderWidth="1px" borderRadius="xl" bg={cardBg}>
              <SkeletonCircle size="48px" mb={4} />
              <SkeletonText mt={4} noOfLines={2} spacing={2} />
            </Box>
          ))}
        </SimpleGrid>

        {/* Chart Skeleton */}
        <Box p={6} borderWidth="1px" borderRadius="xl" bg={cardBg}>
          <Skeleton height="350px" />
        </Box>
      </VStack>
    );
  }

  // Error State
  if (dataMutation.isError) {
    return (
      <Box
        p={8}
        textAlign="center"
        borderWidth="1px"
        borderRadius="xl"
        bg={cardBg}
        borderColor="red.300"
      >
        <Text color="red.500" fontSize="lg" fontWeight="semibold" mb={2}>
          Error Loading Dashboard
        </Text>
        <Text color={textColorSecondary} fontSize="sm" mb={4}>
          {dataMutation.error?.message || 'Something went wrong. Please try again.'}
        </Text>
        <Button colorScheme="blue" onClick={() => dataMutation.mutate()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Empty State
  if (!salesData || (salesData.periodData && salesData.periodData.length === 0)) {
    return (
      <Box
        p={8}
        textAlign="center"
        borderWidth="1px"
        borderRadius="xl"
        bg={cardBg}
      >
        <Text color={textColor} fontSize="lg" fontWeight="semibold" mb={2}>
          No Data Available
        </Text>
        <Text color={textColorSecondary} fontSize="sm">
          Try adjusting your filters to see data for a different time period.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={{ base: 4, md: 6 }} align="stretch" p={{ base: 4, md: 6 }} maxW="100%">
      {/* Selected Filters Section */}
      <Box
        p={{ base: 3, md: 4 }}
        borderWidth="1px"
        borderRadius="xl"
        bg={filterBg}
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 3, sm: 6 }}
            flexWrap="wrap"
          >
            <HStack spacing={2}>
              <Icon as={MdDateRange as React.ElementType} color="blue.500" />
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="xs" color={textColorSecondary} fontWeight="500">
                  Period
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold" color={textColor}>
                  {formatDateDisplay(filters.startDate)} - {formatDateDisplay(filters.endDate)}
                </Text>
              </VStack>
            </HStack>
            {salesData?.users && salesData.users.length > 1 && (
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="xs" color={textColorSecondary} fontWeight="500">
                  User
                </Text>
                <Badge colorScheme="blue" fontSize={{ base: 'xs', md: 'sm' }} px={2} py={1}>
                  {filters.userId === 'all'
                    ? 'All Users'
                    : salesData?.users.find((user) => user._id === filters.userId)?.name}
                </Badge>
              </VStack>
            )}
          </Flex>

          <Button
            size={{ base: 'sm', md: 'md' }}
            colorScheme="blue"
            onClick={onOpen}
            leftIcon={<Icon as={MdDateRange as React.ElementType} />}
            width={{ base: '100%', sm: 'auto' }}
            minW={{ base: 'auto', sm: '140px' }}
          >
            Edit Filters
          </Button>
        </Flex>
      </Box>

      {/* Filters Popup */}
      <Filters
        isOpen={isOpen}
        onClose={onClose}
        users={salesData?.users || []}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
        <SummaryCard
          title="Total Sales"
          value={salesData?.totalOrders || 0}
          icon={FaShoppingCart as React.ElementType}
          bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        />
        <SummaryCard
          title="Total Revenue"
          value={`₹${salesData?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          icon={FaRupeeSign as React.ElementType}
          bgGradient="linear(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <SummaryCard
          title="Average Order Value"
          value={`₹${averageOrderValue.toLocaleString('en-IN')}`}
          icon={FaRupeeSign as React.ElementType}
          bgGradient="linear(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </SimpleGrid>

      {/* Chart Section */}
      <Box
        p={{ base: 4, md: 6 }}
        borderWidth="1px"
        borderRadius="xl"
        bg={cardBg}
        borderColor={borderColor}
        boxShadow="0px 18px 40px rgba(112, 144, 176, 0.12)"
      >
        {/* Data Type Toggle */}
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          mb={6}
          gap={4}
        >
          <Text 
            fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
            fontWeight="bold" 
            color={textColor}
            mb={{ base: 2, sm: 0 }}
          >
            Analytics Overview
          </Text>
          <HStack spacing={2} w={{ base: '100%', sm: 'auto' }} justify={{ base: 'stretch', sm: 'flex-end' }}>
            <Button
              size={{ base: 'sm', md: 'md' }}
              colorScheme={dataType === 'sales' ? 'blue' : 'gray'}
              variant={dataType === 'sales' ? 'solid' : 'outline'}
              onClick={() => setDataType('sales')}
              leftIcon={<Icon as={FaShoppingCart as React.ElementType} />}
              flex={{ base: 1, sm: 'none' }}
            >
              Sales
            </Button>
            <Button
              size={{ base: 'sm', md: 'md' }}
              colorScheme={dataType === 'revenue' ? 'blue' : 'gray'}
              variant={dataType === 'revenue' ? 'solid' : 'outline'}
              onClick={() => setDataType('revenue')}
              leftIcon={<Icon as={FaRupeeSign as React.ElementType} />}
              flex={{ base: 1, sm: 'none' }}
            >
              Revenue
            </Button>
          </HStack>
        </Flex>

        {/* Period Type Toggle */}
        <Flex
          justify="center"
          mb={6}
          gap={2}
          flexWrap="wrap"
          w="100%"
        >
          {['daily', 'weekly', 'monthly'].map((period) => (
            <Button
              key={period}
              size={{ base: 'sm', md: 'md' }}
              colorScheme={filters.period === period ? 'blue' : 'gray'}
              variant={filters.period === period ? 'solid' : 'outline'}
              onClick={() => setFilters({ ...filters, period })}
              textTransform="capitalize"
              flex={{ base: '1 1 calc(33.333% - 8px)', sm: 'none' }}
              minW={{ base: 'auto', sm: '80px' }}
            >
              {period}
            </Button>
          ))}
        </Flex>

        {/* Enhanced Chart */}
        <EnhancedChart
          periodData={salesData?.periodData || []}
          dataType={dataType}
        />
      </Box>
    </VStack>
  );
};

export default Dashboard;