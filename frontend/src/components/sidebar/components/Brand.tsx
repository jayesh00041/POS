// Chakra imports
import { Flex } from '@chakra-ui/react';

// Custom components
// import { HorizonLogo } from 'components/icons/Icons';
import { HSeparator } from 'components/separator/Separator';
import logo from 'assets/img/logo/juicy-jalsa-logo.png'

export function SidebarBrand() {
	//   Chakra color mode
	// let logoColor = useColorModeValue('navy.700', 'white');

	return (
		<Flex alignItems='center' flexDirection='column'>
			<img src={logo} alt="logo"/>
			{/* <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} /> */}
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
