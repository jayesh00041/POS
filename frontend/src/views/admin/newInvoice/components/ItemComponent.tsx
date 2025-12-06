import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon, AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useCart } from "../../../../contexts/CartContext";

export default function ItemComponent({ product }) {
  const boxBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");
  const buttonBg = useColorModeValue("blue.500", "blue.200");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.300");
  const highlightBorderColor = useColorModeValue("blue.500", "blue.200");
  const highlightBgColor = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const quantityButtonBg = useColorModeValue("gray.100", "gray.600");
  const quantityButtonHoverBg = useColorModeValue("gray.200", "gray.500");
  const { cart, addToCart, removeFromCart } = useCart();

  const getVariationKey = (productId, variationId) =>
    variationId ? `${productId}-${variationId}` : `${productId}`;

  const getTotalQuantity = () =>
    Object.values(cart).reduce(
      (sum, item) => (item.product.id === product.id ? sum + item.quantity : sum),
      0
    );

  const isProductInCart = getTotalQuantity() > 0;
  const totalPrice = Object.values(cart)
    .filter((item) => item.product.id === product.id)
    .reduce(
      (sum, item) =>
        sum + (item.selectedVariation?.price || item.product.price) * item.quantity,
      0
    );

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="lg"
      bgColor={isProductInCart ? highlightBgColor : boxBg}
      borderColor={isProductInCart ? highlightBorderColor : borderColor}
      width="100%"
      boxShadow={isProductInCart ? "0px 2px 8px rgba(66, 153, 225, 0.15)" : "none"}
      transition="all 0.2s ease"
      _hover={{ 
        borderColor: highlightBorderColor,
        boxShadow: "0px 2px 8px rgba(66, 153, 225, 0.1)",
      }}
      position="relative"
    >
      <VStack align="stretch" spacing={2.5}>
        {/* Product Image and Name */}
        <Flex align="center" gap={2.5}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              boxSize="50px"
              borderRadius="md"
              objectFit="cover"
              borderWidth="1px"
              borderColor={borderColor}
            />
          ) : (
            <Avatar 
              name={product.name} 
              size="md" 
              bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              fontWeight="600"
              fontSize="sm"
            />
          )}

          <Box flex="1" minW={0}>
            <Text 
              fontWeight="600" 
              color={textColor} 
              fontSize="sm"
              noOfLines={2}
              lineHeight="1.3"
            >
              {product.name}
            </Text>
            <Text 
              fontSize="sm" 
              color={isProductInCart ? highlightBorderColor : textColorSecondary}
              fontWeight="600"
              mt={0.5}
            >
              {(product.price.includes("₹") ? "" : "₹")}
              {product.price}
            </Text>
          </Box>
        </Flex>

        {/* Variations Menu or Quantity Controls */}
        {product.variations?.length > 0 ? (
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              size="sm"
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              color="white"
              width="100%"
              fontWeight="500"
              fontSize="xs"
              h="32px"
            >
              {product.variationType}
            </MenuButton>
            <MenuList maxH="400px" overflowY="auto" p={1.5}>
              {product.variations.map((variation) => {
                const key = getVariationKey(product.id, variation._id);
                const variationQty = cart[key]?.quantity || 0;
                return (
                  <MenuItem
                    key={variation._id}
                    justifyContent="space-between"
                    p={2}
                    borderRadius="md"
                    mb={0.5}
                    _hover={{ bg: quantityButtonBg }}
                  >
                    <Box flex="1">
                      <Text fontSize="xs" fontWeight="600">
                        {variation.name}
                      </Text>
                      <Text fontSize="2xs" color={textColorSecondary}>
                        ₹{variation.price}
                      </Text>
                    </Box>
                    <Flex align="center" gap={1.5} ml={3}>
                      <IconButton
                        size="xs"
                        aria-label="Decrease"
                        icon={<MinusIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(product.id, variation._id);
                        }}
                        isDisabled={variationQty === 0}
                        bg={quantityButtonBg}
                        _hover={{ bg: quantityButtonHoverBg }}
                        color={textColor}
                        h="24px"
                        w="24px"
                      />
                      <Text 
                        minW="32px" 
                        textAlign="center" 
                        fontSize="xs" 
                        fontWeight="700"
                        color={variationQty > 0 ? highlightBorderColor : textColorSecondary}
                      >
                        {variationQty}
                      </Text>
                      <IconButton
                        size="xs"
                        aria-label="Increase"
                        icon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, variation);
                        }}
                        bg={buttonBg}
                        _hover={{ bg: buttonHoverBg }}
                        color="white"
                        h="24px"
                        w="24px"
                      />
                    </Flex>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        ) : (
          <Flex align="center" justify="center" gap={2}>
            <IconButton
              size="sm"
              aria-label="Decrease"
              icon={<MinusIcon />}
              onClick={() => removeFromCart(product.id)}
              isDisabled={!cart[product.id] || cart[product.id]?.quantity === 0}
              bg={quantityButtonBg}
              _hover={{ bg: quantityButtonHoverBg }}
              color={textColor}
              borderRadius="md"
              h="32px"
              w="32px"
            />
            <Box
              minW="44px"
              textAlign="center"
              px={2}
              py={1}
              bg={isProductInCart ? highlightBorderColor : quantityButtonBg}
              borderRadius="md"
            >
              <Text 
                fontSize="sm" 
                fontWeight="700"
                color={isProductInCart ? "white" : textColor}
              >
                {cart[product.id]?.quantity || 0}
              </Text>
            </Box>
            <IconButton
              size="sm"
              aria-label="Increase"
              icon={<AddIcon />}
              onClick={() => addToCart(product)}
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              color="white"
              borderRadius="md"
              h="32px"
              w="32px"
            />
          </Flex>
        )}

        {/* Total Quantity and Price - Only show when in cart */}
        {isProductInCart && (
          <Flex
            direction="row"
            justifyContent="space-between"
            pt={2}
            borderTopWidth="1px"
            borderTopColor={borderColor}
            fontSize="xs"
          >
            <Text fontWeight="500" color={textColorSecondary}>
              Items: {getTotalQuantity()}
            </Text>
            <Text fontWeight="700" color={highlightBorderColor} fontSize="sm">
              ₹{totalPrice}
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
}