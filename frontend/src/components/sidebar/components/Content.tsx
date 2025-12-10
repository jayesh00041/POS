// chakra imports
import { Box, Flex, Stack, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Brand from '../../../components/sidebar/components/Brand';
import Links from '../../../components/sidebar/components/Links';
import SidebarCard from '../../../components/sidebar/components/SidebarCard';

// FUNCTIONS

function SidebarContent(props: { 
  routes: RoutesType[]; 
  onLinkClick?: () => void; 
  isHovered?: boolean; // Add isHovered prop
}) {
  const { routes, onLinkClick, isHovered } = props;
  const dividerColor = useColorModeValue(
    'rgba(66, 153, 225, 0.08)',
    'rgba(66, 153, 225, 0.12)'
  );

  return (
    <Flex direction="column" height="100%" pt="18px" borderRadius="30px">
      <Brand isHovered={isHovered} />
      <Stack direction="column" mt="8px" mb="auto" spacing="2px">
        <Box ps="0" pe="0" onClick={onLinkClick}>
          <Links routes={routes} isHovered={isHovered} /> {/* Pass isHovered to Links */}
        </Box>
      </Stack>

      <Box 
        ps={isHovered ? "16px" : "8px"} 
        pe={isHovered ? "16px" : "8px"} 
        mt="40px" 
        mb="28px" 
        borderRadius="16px"
        borderTop="1px solid"
        borderColor={dividerColor}
        pt="20px"
        transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <SidebarCard />
      </Box>
    </Flex>
  );
}

export default SidebarContent;