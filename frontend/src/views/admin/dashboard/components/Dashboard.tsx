import { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Button, useColorMode, useDisclosure } from '@chakra-ui/react';
import Filters from './Filters';
import SalesAndRevenue from './SalesRevenue';
import { getSalesOverview } from '../../../../http-routes/index'; // Your API functions
import { useMutation } from '@tanstack/react-query';

const Dashboard = () => {
  const { colorMode } = useColorMode();
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

  if (!dataMutation || dataMutation.isPending) return <Box>Loading...</Box>;

  return (
    <VStack spacing={4} align="stretch" p={4}>
      {/* Selected Filters Section */}
      <Box p={2} px={4} borderWidth="1px" borderRadius="sm" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}>
        <HStack justifyContent="space-between">
          <HStack spacing={4}>
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="xs" >Period</Text>
              <Text fontSize="sm" fontWeight="medium">
                {formatDateDisplay(filters.startDate)} - {formatDateDisplay(filters.endDate)}
              </Text>
            </VStack>
            {(salesData?.users && (salesData.users.length > 1)) && (
              <VStack align="flex-start" spacing={0}>
              <Text fontSize="xs" >User</Text>
              <Text fontSize="sm" fontWeight="medium">
                  {filters.userId === 'all' ? 'All Users' : salesData?.users.find(user => user._id === filters.userId)?.name}
              </Text>
            </VStack>
            )}
          </HStack>
          
          <Button size="xs" colorScheme="blue" onClick={onOpen}>
            Edit Filters
          </Button>
        </HStack>
      </Box>

      {/* Filters Popup */}
      <Filters
        isOpen={isOpen}
        onClose={onClose}
        users={salesData?.users || []}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <Box p={4} borderWidth="1px" borderRadius="sm" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}>
        {/* Sales/Revenue Toggle */}
        <HStack  spacing={4}>
          <Button size="lg" flexDirection="column" borderRadius="none" flex={1} colorScheme={dataType === 'sales' ? 'blue' : 'gray'} onClick={() => setDataType('sales')}>
            <Text fontSize="xs">Total Sales<br/> </Text>
            <Text fontSize="sm" fontWeight="bold">{salesData?.totalOrders}</Text>
          </Button>
          <Button size="lg" flexDirection="column" borderRadius="none" flex={1} colorScheme={dataType === 'revenue' ? 'blue' : 'gray'} onClick={() => setDataType('revenue')}>
            <Text fontSize="xs">Total Revenue<br/> </Text>
            <Text fontSize="sm" fontWeight="bold">₹{salesData?.totalRevenue}</Text>
          </Button>
        </HStack>

        {/* Period Type Toggle */}
        <HStack justifyContent="center" my={2}>
          <Button size="xs" borderRadius="none" colorScheme={filters.period === 'daily' ? 'blue' : 'gray'} onClick={() => setFilters({ ...filters, period: 'daily' })}>
            Daily
          </Button>
          <Button size="xs" borderRadius="none" ml="0px" colorScheme={filters.period === 'weekly' ? 'blue' : 'gray'} onClick={() => setFilters({ ...filters, period: 'weekly' })}>
            Weekly
          </Button>
          <Button size="xs" borderRadius="none" ml="0px" colorScheme={filters.period === 'monthly' ? 'blue' : 'gray'} onClick={() => setFilters({ ...filters, period: 'monthly' })}>
            Monthly
          </Button>
        </HStack>


        {/* Chart Section */}
        <SalesAndRevenue
          periodData={salesData?.periodData || []}
          dataType={dataType}
        />
      </Box>

    </VStack>
  );
};

export default Dashboard;