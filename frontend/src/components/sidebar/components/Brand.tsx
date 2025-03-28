// Chakra imports
import { Flex } from '@chakra-ui/react';

// Custom components
// import { HorizonLogo } from '../../../../components/icons/Icons';
import { HSeparator } from '../../../components/separator/Separator';
import logo from 'assets/img/logo/jalso-park-logo.png'

export function SidebarBrand() {
	//   Chakra color mode
	// let logoColor = useColorModeValue('navy.700', 'white');

	return (
		<Flex alignItems='center' justifyContent='center' flexDirection='column'>
			<img src={logo} alt="logo" width="90px" height="90px" />
			{/* <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} /> */}
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
