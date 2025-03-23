// Chakra imports
import { Box } from '@chakra-ui/react';
import ProductsTable from './components/ProductsTable';

export default function Overview() {
	return (
		<Box pt={{ base: '55px', md: '80px', xl: '80px' }}>
			{/* Main Fields */}
			<ProductsTable></ProductsTable>
		</Box>
	);
}