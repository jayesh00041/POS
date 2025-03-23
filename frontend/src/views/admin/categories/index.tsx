// Chakra imports
import { Box } from '@chakra-ui/react';
import CategoriesTable from './components/CategoriesTable';

export default function Overview() {
	return (
		<Box pt={{ base: '55px', md: '80px', xl: '80px' }}>
			{/* Main Fields */}
			<CategoriesTable></CategoriesTable>
		</Box>
	);
}