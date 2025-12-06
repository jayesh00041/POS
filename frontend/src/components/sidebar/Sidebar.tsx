import React, { useState } from 'react';

// Chakra imports
import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import Content from '../../components/sidebar/components/Content';
import {
  renderThumb,
  renderTrack,
  renderView,
} from '../../components/scrollbar/Scrollbar';
import { Scrollbars } from 'react-custom-scrollbars-2';

// Assets
import { IoMenuOutline } from 'react-icons/io5';

function Sidebar(props: { routes: RoutesType[]; [x: string]: any }) {
  const { routes } = props;

  const [isHovered, setIsHovered] = useState(false); // State to track hover

  let variantChange = '0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  let shadow = useColorModeValue(
    '0 8px 32px rgba(31, 38, 135, 0.15)',
    '0 8px 32px rgba(0, 0, 0, 0.3)',
  );
  // Chakra Color Mode - Modern glassmorphism
  let sidebarBg = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(20, 25, 40, 0.8)'
  );
  let sidebarMargins = '0px';

  // SIDEBAR
  return (
    <Box
      display={{ sm: 'none', xl: 'block' }}
      zIndex={99999}
      position="fixed"
      minH="100%"
      onMouseEnter={() => setIsHovered(true)} // Handle hover in
      onMouseLeave={() => setIsHovered(false)} // Handle hover out
    >
      <Box
        bg={sidebarBg}
        backdropFilter="blur(8px)"
        transition={variantChange}
        w={isHovered ? '280px' : '85px'} // Adjust width based on hover
        h="100vh"
        m={sidebarMargins}
        minH="100%"
        overflowX="hidden"
        boxShadow={shadow}
        borderRight="1px solid"
        borderColor={useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.08)')}
      >
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        >
          <Content routes={routes} isHovered={isHovered} /> {/* Pass hover state to Content */}
        </Scrollbars>
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props: { routes: RoutesType[] }) {
  let sidebarBackgroundColor = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(20, 25, 40, 0.9)'
  );
  let menuColor = useColorModeValue('gray.600', 'gray.200');
  const menushadow = useColorModeValue(
    '0 8px 32px rgba(31, 38, 135, 0.15)',
    '0 8px 32px rgba(0, 0, 0, 0.3)',
  );

  let menuBg = useColorModeValue(
    'rgba(255, 255, 255, 0.7)',
    'rgba(20, 25, 40, 0.7)',
  );
  // SIDEBAR
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const { routes } = props;

  return (
    <Flex display={{ sm: 'flex', xl: 'none' }} alignItems="center">
      <Flex
        ref={btnRef}
        w="max-content"
        h="max-content"
        onClick={onOpen}
        p="10px"
        borderRadius="full"
        height="56px"
        width="56px"
        bg={menuBg}
        backdropFilter="blur(8px)"
        boxShadow={menushadow}
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="1px solid"
        borderColor={useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.08)')}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'scale(1.08)',
          boxShadow: useColorModeValue(
            '0 12px 40px rgba(31, 38, 135, 0.2)',
            '0 12px 40px rgba(0, 0, 0, 0.4)'
          ),
        }}
      >
        <Icon
          as={IoMenuOutline as React.ElementType}
          color={menuColor}
          my="auto"
          w="24px"
          h="24px"
          _hover={{ cursor: 'pointer' }}
          transition="all 0.3s ease"
        />
      </Flex>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === 'rtl' ? 'right' : 'left'}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent 
          w="280px" 
          maxW="280px" 
          bg={sidebarBackgroundColor}
          backdropFilter="blur(8px)"
          borderRight="1px solid"
          borderColor={useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.08)')}
          boxShadow={menushadow}
        >
          <DrawerCloseButton
            zIndex="3"
            onClick={onClose}
            _focus={{ boxShadow: 'none' }}
            _hover={{ boxShadow: 'none' }}
          />
          <DrawerBody maxW="280px" px="0rem" pb="0">
            <Scrollbars
              autoHide
              renderTrackVertical={renderTrack}
              renderThumbVertical={renderThumb}
              renderView={renderView}
            >
              <Content routes={routes} onLinkClick={onClose} isHovered={true} />
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

export default Sidebar;