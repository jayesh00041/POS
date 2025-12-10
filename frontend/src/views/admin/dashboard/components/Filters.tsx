import { useState } from 'react';
import {
  Box,
  Select,
  Button,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
  useColorModeValue,
  Text,
  Divider,
} from '@chakra-ui/react';

interface FiltersProps {
  isOpen: boolean;
  onClose: () => void;
  users: { _id: string; name: string }[];
  filters: { userId: string; startDate: string; endDate: string; period: string };
  onFilterChange: (filters: { userId: string; startDate: string; endDate: string; period: string }) => void;
}

const Filters = ({ isOpen, onClose, users, filters, onFilterChange }: FiltersProps) => {
  const [userId, setUserId] = useState(filters.userId);
  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);
  const cardBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getQuickDatePresets = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return [
      { label: 'Today', start: formatDate(today), end: formatDate(today) },
      { label: 'Yesterday', start: formatDate(yesterday), end: formatDate(yesterday) },
      { label: 'Last 7 Days', start: formatDate(last7Days), end: formatDate(today) },
      { label: 'Last 30 Days', start: formatDate(last30Days), end: formatDate(today) },
      { label: 'This Month', start: formatDate(thisMonthStart), end: formatDate(today) },
      { label: 'Last Month', start: formatDate(lastMonthStart), end: formatDate(lastMonthEnd) },
    ];
  };

  const handleQuickPreset = (preset: { start: string; end: string }) => {
    setStartDate(preset.start);
    setEndDate(preset.end);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      ...filters,
      userId,
      startDate,
      endDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent bg={cardBg} mx={{ base: 4, md: 0 }}>
        <ModalHeader fontSize={{ base: 'lg', md: 'xl' }} color={textColor}>
          Filter Dashboard
        </ModalHeader>
        <ModalCloseButton size="sm" />
        <ModalBody>
          <Stack spacing={4}>
            {/* Quick Date Presets */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
                Quick Date Presets
              </Text>
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                {getQuickDatePresets().map((preset) => (
                  <Button
                    key={preset.label}
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickPreset(preset)}
                    isActive={startDate === preset.start && endDate === preset.end}
                    colorScheme="blue"
                    fontSize="xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Users Dropdown (only if multiple users exist) */}
            {users.length > 1 && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={textColor}>
                  Select User
                </FormLabel>
                <Select
                  size="md"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Select user"
                >
                  <option value="all">All Users</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Custom Date Range */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
                Custom Date Range
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color={textColor}>
                    Start Date
                  </FormLabel>
                  <Input
                    size="md"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color={textColor}>
                    End Date
                  </FormLabel>
                  <Input
                    size="md"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="md" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="md" colorScheme="blue" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default Filters;