// Chakra imports
import { Flex, Box, useColorModeValue } from '@chakra-ui/react';

// Custom components
// import { HorizonLogo } from '../../../../components/icons/Icons';
import { HSeparator } from '../../../components/separator/Separator';
import logo from 'assets/img/logo/jalso-park-logo.png'

export function SidebarBrand(props: { isHovered?: boolean }) {
	//   Chakra color mode
	const { isHovered = false } = props;
	
	// Adjust logo size based on sidebar state
	const logoSize = isHovered ? '80px' : '48px';
	const bgColor = useColorModeValue(
		'rgba(66, 153, 225, 0.08)',
		'rgba(66, 153, 225, 0.12)'
	);
	const borderColor = useColorModeValue(
		'rgba(66, 153, 225, 0.12)',
		'rgba(66, 153, 225, 0.18)'
	);

	return (
		<Flex 
			alignItems='center' 
			justifyContent='center' 
			flexDirection='column'
			bg={bgColor}
			backdropFilter="blur(8px)"
			borderRadius={isHovered ? "16px" : "12px"}
			p={isHovered ? "16px" : "12px"}
			mx={isHovered ? "16px" : "12px"}
			mb="20px"
			border="1px solid"
			borderColor={borderColor}
			transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
			_hover={{
				bg: useColorModeValue(
					'rgba(66, 153, 225, 0.12)',
					'rgba(66, 153, 225, 0.18)'
				),
				borderColor: useColorModeValue(
					'rgba(66, 153, 225, 0.18)',
					'rgba(66, 153, 225, 0.25)'
				),
			}}
		>
			<Box
				transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
				_hover={{
					transform: "scale(1.05)",
				}}
			>
				<img 
					src={logo} 
					alt="logo" 
					width={logoSize} 
					height={logoSize} 
					style={{ 
						transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
						filter: 'drop-shadow(0 2px 8px rgba(66, 153, 225, 0.1))'
					}} 
				/>
			</Box>
			{isHovered && <HSeparator mb='12px' mt='12px' />}
		</Flex>
	);
}

export default SidebarBrand;
