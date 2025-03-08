// Chakra Imports
import {
  Avatar,
  // Button,
  Flex,
  Icon,
  // Image,
  // Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  Box,
} from '@chakra-ui/react';
// Custom Components
// import { ItemContent } from 'components/menu/ItemContent';
// import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React from 'react';
// Assets
// import navImage from 'assets/img/layout/Navbar.png';
// import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import routes from 'routes';
import { useUser } from 'contexts/UserContext';
import { useMutation } from '@tanstack/react-query';
import { logout } from 'http-routes';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
export default function HeaderLinks(props: { secondary: boolean }) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue(
    'rgba(255, 255, 255, 0.5)',
    'rgba(0, 0, 0, 0.5)',
  );
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  // const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  // const ethColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  // const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
  // const ethBox = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );
  // const borderButton = useColorModeValue('secondaryGray.500', 'whiteAlpha.200');

  const navigate = useNavigate();
  const { logoutUser, user } = useUser();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      logoutUser();
      enqueueSnackbar('Logout successful', { variant: 'success' });
      navigate('/auth/sign-in');
    },
    onError: (error) => {
      enqueueSnackbar('Logout failed', { variant: 'error' });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  return (
    <Flex
      alignItems="center"
      flexDirection="row"
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      w={{ sm: '100%', md: 'auto' }}
    >
      {/* <SearchBar
				mb={() => {
					if (secondary) {
						return { base: '10px', md: 'unset' };
					}
					return 'unset';
				}}
				me='10px'
				borderRadius='30px'
			/> */}
      <Box
        p="10px"
        borderRadius="30px"
        height="60px"
        width="60px"
        bg={menuBg}
        boxShadow={shadow}
		display="flex"
		justifyContent="center"
		alignItems="center"
      >
        <SidebarResponsive routes={routes} />
      </Box>
      {/* <Menu>
				<MenuButton p='0px'>
					<Icon mt='6px' as={MdNotificationsNone} color={navbarIcon} w='18px' h='18px' me='10px' />
				</MenuButton>
				<MenuList
					boxShadow={shadow}
					p='20px'
					borderRadius='20px'
					bg={menuBg}
					border='none'
					mt='22px'
					me={{ base: '30px', md: 'unset' }}
					minW={{ base: 'unset', md: '400px', xl: '450px' }}
					maxW={{ base: '360px', md: 'unset' }}>
					<Flex w='100%' mb='20px'>
						<Text fontSize='md' fontWeight='600' color={textColor}>
							Notifications
						</Text>
						<Text fontSize='sm' fontWeight='500' color={textColorBrand} ms='auto' cursor='pointer'>
							Mark all read
						</Text>
					</Flex>
					<Flex flexDirection='column'>
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} px='0' borderRadius='8px' mb='10px'>
							<ItemContent info='Horizon UI Dashboard PRO' />
						</MenuItem>
						<MenuItem _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} px='0' borderRadius='8px' mb='10px'>
							<ItemContent info='Horizon Design System Free' />
						</MenuItem>
					</Flex>
				</MenuList>
			</Menu> */}

      <Menu>
        <MenuButton
          p="10px"
          borderRadius="30px"
          height="60px"
          width="60px"
          bg={menuBg}
          boxShadow={shadow}
          ml="auto"
        >
          <Avatar
            _hover={{ cursor: 'pointer' }}
            color="white"
            name={user.name}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋&nbsp; Hey, {user.name}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
              onClick={toggleColorMode}
            >
              <Icon
                me="10px"
                h="18px"
                w="18px"
                color={navbarIcon}
                as={
                  (colorMode === 'light'
                    ? IoMdMoon
                    : IoMdSunny) as React.ElementType
                }
              />
              <Text fontSize="sm">
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </MenuItem>

            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              color="red.400"
              borderRadius="8px"
              px="14px"
              onClick={handleLogout}
            >
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
