/* eslint-disable */

import { NavLink, useLocation } from 'react-router-dom';
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { usePrivilege } from '../../../contexts/PrivilegeContext';

export function SidebarLinks(props: {
  routes: RoutesType[];
  isHovered?: boolean; // Add isHovered prop
}) {

  const { isUserAuthorised } = usePrivilege();
  // Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue('secondaryGray.600', 'secondaryGray.600');
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('brand.500', 'brand.400');
  let hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  let tooltipBg = useColorModeValue('gray.800', 'gray.200');
  let tooltipColor = useColorModeValue('white', 'gray.800');

  const { routes, isHovered } = props;

  // Verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName);
  };

  // This function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes: RoutesType[]) => {
    return routes.map((route: RoutesType, index: number) => {
      if (route.layout === '/admin') {
        const isActive = activeRoute(route.path.toLowerCase());
        const linkContent = (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box
                position="relative"
                _hover={{
                  bg: hoverBg,
                }}
                borderRadius="xl"
                mx="10px"
                transition="all 0.2s ease"
              >
                <HStack
                  spacing={isHovered ? (isActive ? '16px' : '20px') : '0px'}
                  py="12px"
                  ps={isHovered ? "20px" : "0px"}
                  justifyContent={isHovered ? "flex-start" : "center"}
                  position="relative"
                >
                  <Flex 
                    w="100%" 
                    alignItems="center" 
                    justifyContent={isHovered ? "flex-start" : "center"}
                    position="relative"
                  >
                    <Box
                      color={isActive ? activeIcon : textColor}
                      me={isHovered ? "12px" : "0px"}
                      transition="all 0.2s ease"
                      transform={isActive ? "scale(1.1)" : "scale(1)"}
                    >
                      {route.icon}
                    </Box>
                    {isHovered && (
                      <Text
                        me="auto"
                        color={isActive ? activeColor : textColor}
                        fontWeight={isActive ? '700' : '500'}
                        fontSize="sm"
                        transition="all 0.2s ease"
                        opacity={isHovered ? 1 : 0}
                      >
                        {route.name}
                      </Text>
                    )}
                  </Flex>
                  {isActive && (
                    <Box
                      position="absolute"
                      left="0"
                      top="50%"
                      transform="translateY(-50%)"
                      h="60%"
                      w="4px"
                      bg={brandColor}
                      borderRadius="0 5px 5px 0"
                      transition="all 0.2s ease"
                    />
                  )}
                  {isActive && isHovered && (
                    <Box
                      position="absolute"
                      right="0"
                      top="50%"
                      transform="translateY(-50%)"
                      w="3px"
                      h="40%"
                      bg={brandColor}
                      borderRadius="5px 0 0 5px"
                      opacity="0.5"
                    />
                  )}
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={activeRoute(route.path.toLowerCase()) ? '22px' : '26px'}
                  py="5px"
                  ps="10px"
                >
                  {isHovered && (
                    <Text
                      me="auto"
                      color={activeRoute(route.path.toLowerCase()) ? activeColor : inactiveColor}
                      fontWeight={activeRoute(route.path.toLowerCase()) ? 'bold' : 'normal'}
                    >
                      {route.name}
                    </Text>
                  )}
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </NavLink>
        );

        // Wrap with tooltip when sidebar is collapsed
        if (!isHovered && route.icon) {
          return isUserAuthorised(route.privilege, (
            <Tooltip
              key={index}
              label={route.name}
              placement="right"
              hasArrow
              bg={tooltipBg}
              color={tooltipColor}
              fontSize="xs"
              px={3}
              py={2}
              borderRadius="md"
            >
              {linkContent}
            </Tooltip>
          ));
        }

        return isUserAuthorised(route.privilege, linkContent);
      }
    });
  };

  // BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;