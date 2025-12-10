import { Box, Flex, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaShoppingCart, FaRupeeSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Card from '../../../../components/card/Card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgGradient?: string;
  iconColor?: string;
}

const SummaryCard = ({ title, value, icon, trend, bgGradient, iconColor }: SummaryCardProps) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const defaultGradient = useColorModeValue(
    'linear(135deg, #667eea 0%, #764ba2 100%)',
    'linear(135deg, #667eea 0%, #764ba2 100%)'
  );

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      p={{ base: 4, md: 6 }}
      boxShadow="0px 18px 40px rgba(112, 144, 176, 0.12)"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0px 20px 40px rgba(112, 144, 176, 0.16)',
        transition: 'all 0.3s ease',
      }}
      transition="all 0.3s ease"
    >
      <Flex direction="column" h="100%">
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box
            w={{ base: '40px', md: '48px' }}
            h={{ base: '40px', md: '48px' }}
            bgGradient={bgGradient || defaultGradient}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0px 4px 12px rgba(102, 126, 234, 0.3)"
          >
            <Icon as={icon as React.ElementType} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color="white" />
          </Box>
          {trend && (
            <Flex
              align="center"
              gap={1}
              px={2}
              py={1}
              borderRadius="md"
              bg={trend.isPositive ? 'green.50' : 'red.50'}
              color={trend.isPositive ? 'green.600' : 'red.600'}
            >
              <Icon
                as={trend.isPositive ? (FaArrowUp as React.ElementType) : (FaArrowDown as React.ElementType)}
                w={3}
                h={3}
              />
              <Text fontSize="xs" fontWeight="semibold">
                {Math.abs(trend.value)}%
              </Text>
            </Flex>
          )}
        </Flex>
        <Box flex="1">
          <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            color={textColorSecondary}
            fontWeight="500"
            mb={1}
          >
            {title}
          </Text>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            color={textColor}
            fontWeight="bold"
            lineHeight="1.2"
          >
            {value}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
};

export default SummaryCard;

