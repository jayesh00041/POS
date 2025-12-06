// chakra imports
import { Box, Flex, Stack } from '@chakra-ui/react';
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

  return (
    <Flex direction="column" height="100%" pt="25px" borderRadius="30px">
      <Brand isHovered={isHovered} />
      <Stack direction="column" mt="8px" mb="auto">
        <Box ps="20px" pe={{ lg: "16px", "2xl": "16px" }} onClick={onLinkClick}>
          <Links routes={routes} isHovered={isHovered} /> {/* Pass isHovered to Links */}
        </Box>
      </Stack>

      <Box ps="20px" pe={{ lg: "16px", "2xl": "20px" }} mt="60px" mb="40px" borderRadius="30px">
        <SidebarCard />
      </Box>
    </Flex>
  );
}

export default SidebarContent;