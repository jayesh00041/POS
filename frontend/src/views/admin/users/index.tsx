// Chakra imports
import { Box } from '@chakra-ui/react';
import Userstable from './components/UsersTable';

export default function Overview() {
	return (
		<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
			{/* Main Fields */}
			<Userstable></Userstable>
		</Box>
	);
}