// Chakra imports
import { Flex } from '@chakra-ui/react';

// Custom components
// import { HorizonLogo } from '../../../../components/icons/Icons';
import { HSeparator } from '../../../components/separator/Separator';
import logo from 'assets/img/logo/jalso-park-logo.png'

export function SidebarBrand(props: { isHovered?: boolean }) {
	//   Chakra color mode
	// let logoColor = useColorModeValue('navy.700', 'white');
	const { isHovered = false } = props;
	
	// Adjust logo size based on sidebar state
	const logoSize = isHovered ? '90px' : '50px';

	return (
		<Flex alignItems='center' justifyContent='center' flexDirection='column'>
			<img src={logo} alt="logo" width={logoSize} height={logoSize} style={{ transition: 'width 0.2s linear, height 0.2s linear' }} />
			{/* <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} /> */}
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
