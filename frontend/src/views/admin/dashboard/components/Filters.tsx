import { useState } from 'react';
import {
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

  const handleApplyFilters = () => {
    onFilterChange({
      ...filters,
      userId,
      startDate,
      endDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Edit Filters</ModalHeader>
        <ModalCloseButton size="sm" />
        <ModalBody>
          <Stack spacing={3}>
            {/* Users Dropdown (only if multiple users exist) */}
            {users.length > 1 && (
              <FormControl>
                <FormLabel fontSize="sm">Select User</FormLabel>
                <Select
                  size="sm"
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

            {/* Start Date Picker */}
            <FormControl>
              <FormLabel fontSize="sm">Start Date</FormLabel>
              <Input
                size="sm"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>

            {/* End Date Picker */}
            <FormControl>
              <FormLabel fontSize="sm">End Date</FormLabel>
              <Input
                size="sm"                
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button size="sm" colorScheme="blue" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default Filters;