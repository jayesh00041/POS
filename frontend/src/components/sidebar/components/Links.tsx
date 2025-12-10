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
  let inactiveColor = useColorModeValue('gray.500', 'gray.400');
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('gray.600', 'gray.300');
  let brandColor = useColorModeValue('brand.500', 'brand.400');
  let activeBg = useColorModeValue('rgba(66, 153, 225, 0.1)', 'rgba(66, 153, 225, 0.15)');
  let hoverBg = useColorModeValue('rgba(66, 153, 225, 0.05)', 'rgba(66, 153, 225, 0.08)');
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
                borderRadius={isHovered ? "12px" : "full"}
                mx={isHovered ? "12px" : "8px"}
                transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                bg={isActive ? activeBg : 'transparent'}
              >
                <HStack
                  spacing={isHovered ? (isActive ? '12px' : '14px') : '0px'}
                  py={isHovered ? "10px" : "12px"}
                  ps={isHovered ? "16px" : "0px"}
                  pr={isHovered ? "16px" : "0px"}
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
                      me={isHovered ? "8px" : "0px"}
                      transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                      transform={isActive ? "scale(1.12) rotate(0deg)" : "scale(1)"}
                      _groupHover={{
                        transform: isActive ? "scale(1.2)" : "scale(1.05)",
                      }}
                    >
                      {route.icon}
                    </Box>
                    {isHovered && (
                      <Text
                        me="auto"
                        color={isActive ? activeColor : textColor}
                        fontWeight={isActive ? '600' : '500'}
                        fontSize="sm"
                        transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
                        opacity={isHovered ? 1 : 0}
                        letterSpacing={isActive ? "0.2px" : "0px"}
                      >
                        {route.name}
                      </Text>
                    )}
                  </Flex>
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