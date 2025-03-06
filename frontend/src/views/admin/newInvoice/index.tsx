import { Box } from '@chakra-ui/react';
import NewInvoiceComponent from './components/NewInvoiceComponent';

export default function Overview() {
	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			{/* Main Fields */}
			<NewInvoiceComponent />
		</Box>
	);
}
