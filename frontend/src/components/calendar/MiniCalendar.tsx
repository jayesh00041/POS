import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'assets/css/MiniCalendar.css';
import { Text, Icon, Button } from '@chakra-ui/react';
// Chakra imports
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
// Custom components
import Card from '../../components/card/Card';

type CalendarValue = Date | [Date, Date] | null;

interface MiniCalendarProps {
  selectRange: boolean;
  maxDate?: Date;
  onDateChange?: (date: CalendarValue) => void;
  [x: string]: any;
}

export default function MiniCalendar({ selectRange, maxDate, onDateChange, ...rest }: MiniCalendarProps) {
  const [value, setValue] = useState<CalendarValue>(new Date());

  const handleChange = (value: CalendarValue) => {
    setValue(value);
  };

  const handleApplyClick = () => {
    if (onDateChange) {
      onDateChange(value); // Call parent function
    }
  };

  return (
    <Card
      alignItems="center"
      flexDirection="column"
      w="100%"
      maxW="max-content"
      p="8px"
      h="max-content"
      {...rest}
    >
        <Calendar
          onChange={handleChange}
          value={value}
          selectRange={selectRange}
          maxDate={maxDate}
          view={'month'}
          tileContent={<Text color="brand.500" />}
          prevLabel={<Icon as={MdChevronLeft as React.ElementType} w="24px" h="24px" mt="4px" />}
          nextLabel={<Icon as={MdChevronRight as React.ElementType} w="24px" h="24px" mt="4px" />}
        />
        <Button colorScheme="blue" size="sm" mt="8px" onClick={handleApplyClick}>
          Apply
        </Button>
    </Card>
  );
}
