// Chakra Imports
import {
  Avatar,
  Box,
  Flex,
  Icon,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  Divider,
} from '@chakra-ui/react';
// Custom Components
// import { ItemContent } from '../../../../components/menu/ItemContent';
// import { SearchBar } from '../../../../components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from '../../components/sidebar/Sidebar';
import logo from '../../assets/img/logo/jalso-park-logo.png';
import PropTypes from 'prop-types';
import React from 'react';
// Assets
// import navImage from 'assets/img/layout/Navbar.png';
// import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FiLogOut, FiUser } from 'react-icons/fi';
import routes from '../../routes';
import { useUser } from '../../contexts/UserContext';
import { useMutation } from '@tanstack/react-query';
import { logout } from 'http-routes';
import { useLocation, useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
export default function HeaderLinks(props: { secondary: boolean }) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();

  let location = useLocation();

  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName);
  };

  const pageName = routes.find((route) => activeRoute(route.path)).name;

  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(0, 0, 0, 0.9)',
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
  const menuItemHover = useColorModeValue('gray.100', 'whiteAlpha.100');
  const menuItemActive = useColorModeValue('blue.50', 'blue.900');
  const logoutHover = useColorModeValue('red.50', 'red.900');

  return (
    <Flex
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      w={{ sm: '100%', md: 'calc(100vw - 165px)' }}
      gap={{ base: 2, md: 4 }}
    >
      {/* Left Section: Sidebar Toggle + Page Title */}
      <HStack spacing={{ base: 2, md: 4 }} flex="1" minW="0">
        <SidebarResponsive routes={routes} />
        <VStack align="flex-start" spacing={0} display={{ base: 'none', md: 'flex' }} flex="1" minW="0">
          <Text
            fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
            fontWeight="700"
            color={textColor}
            lineHeight="1.2"
            noOfLines={1}
          >
            {pageName}
          </Text>
          <Text
            fontSize="xs"
            color={useColorModeValue('secondaryGray.600', 'secondaryGray.400')}
            display={{ base: 'none', lg: 'block' }}
          >
            Welcome back, {user.name}
          </Text>
        </VStack>
      </HStack>

      {/* Center Section: Logo (Mobile Only) */}
      <Box 
        display={{ base: 'flex', xl: 'none' }}
        alignItems="center"
        justifyContent="center"
        position="absolute"
        left="50%"
        transform="translateX(-50%)"
        zIndex={1}
      >
        <img 
          src={logo} 
          alt="logo" 
          height="50px" 
          width="50px"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>

      {/* Right Section: User Menu */}
      <Menu>
        <MenuButton
          as={Box}
          p={{ base: '6px', md: '8px' }}
          borderRadius="xl"
          height="auto"
          width="auto"
          bg={menuBg}
          boxShadow={shadow}
          _hover={{
            boxShadow: useColorModeValue(
              '14px 17px 40px 4px rgba(112, 144, 176, 0.25)',
              '14px 17px 40px 4px rgba(112, 144, 176, 0.1)'
            ),
            transform: 'translateY(-2px)',
          }}
          transition="all 0.2s ease"
          position="relative"
          zIndex={2}
        >
          <HStack spacing={{ base: 0, lg: 3 }} px={{ base: 1, md: 2 }}>
            <Avatar
              _hover={{ cursor: 'pointer' }}
              color="white"
              name={user.name}
              bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
              size={{ base: 'sm', md: 'md' }}
              w={{ base: '36px', md: '44px' }}
              h={{ base: '36px', md: '44px' }}
              boxShadow="0px 4px 12px rgba(102, 126, 234, 0.3)"
            />
            <VStack
              align="flex-start"
              spacing={0}
              display={{ base: 'none', lg: 'flex' }}
            >
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                {user.name}
              </Text>
              <Text fontSize="xs" color={useColorModeValue('secondaryGray.600', 'secondaryGray.400')}>
                Admin
              </Text>
            </VStack>
          </HStack>
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="12px"
          borderRadius="xl"
          bg={menuBg}
          border="none"
          position="relative"
          zIndex="10"
          minW="220px"
        >
          <Box
            px="20px"
            pt="20px"
            pb="16px"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3}>
              <Avatar
                color="white"
                name={user.name}
                bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                size="md"
                w="48px"
                h="48px"
              />
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="md" fontWeight="700" color={textColor}>
                  {user.name}
                </Text>
                <Text fontSize="xs" color={useColorModeValue('secondaryGray.600', 'secondaryGray.400')}>
                  {user?.email || 'admin@jalsopark.com'}
                </Text>
              </VStack>
            </HStack>
          </Box>
          <Flex flexDirection="column" p="8px">
            <MenuItem
              _hover={{ bg: menuItemHover }}
              _focus={{ bg: menuItemActive }}
              borderRadius="lg"
              px="14px"
              py="12px"
              mb="4px"
            >
              <Icon
                me="12px"
                h="18px"
                w="18px"
                color={navbarIcon}
                as={FiUser as React.ElementType}
              />
              <Text fontSize="sm" fontWeight="500">Profile</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: menuItemHover }}
              _focus={{ bg: menuItemActive }}
              borderRadius="lg"
              px="14px"
              py="12px"
              mb="4px"
              onClick={toggleColorMode}
            >
              <Icon
                me="12px"
                h="18px"
                w="18px"
                color={navbarIcon}
                as={
                  (colorMode === 'light'
                    ? IoMdMoon
                    : IoMdSunny) as React.ElementType
                }
              />
              <Text fontSize="sm" fontWeight="500">
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </MenuItem>
            <Divider my="4px" borderColor={borderColor} />
            <MenuItem
              _hover={{ bg: logoutHover }}
              _focus={{ bg: logoutHover }}
              color="red.500"
              borderRadius="lg"
              px="14px"
              py="12px"
              onClick={handleLogout}
            >
              <Icon
                me="12px"
                h="18px"
                w="18px"
                as={FiLogOut as React.ElementType}
              />
              <Text fontSize="sm" fontWeight="500">Log out</Text>
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
