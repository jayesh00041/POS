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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useCart } from "../../../../contexts/CartContext";

export default function ItemComponent({ product }) {
  const boxBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");
  const buttonBg = useColorModeValue("blue.500", "blue.200");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.300");
  const highlightBorderColor = useColorModeValue("blue.500", "blue.200");
  const highlightBgColor = useColorModeValue("blue.50", "blue.900");
  const { cart, addToCart, removeFromCart } = useCart();

  const getVariationKey = (productId, variationId) =>
    variationId ? `${productId}-${variationId}` : `${productId}`;

  const getTotalQuantity = () =>
    Object.values(cart).reduce(
      (sum, item) => (item.product.id === product.id ? sum + item.quantity : sum),
      0
    );

  const isProductInCart = getTotalQuantity() > 0;

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="lg"
      bgColor={isProductInCart ? highlightBgColor : boxBg}
      borderColor={isProductInCart ? highlightBorderColor : "transparent"}
      width="100%"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ borderColor: highlightBorderColor }}
    >
      <Flex align="center" justify="space-between">
        {/* Product Image */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            boxSize="50px"
            borderRadius="md"
            objectFit="cover"
            mr={3}
          />
        ) : (
          <Avatar name={product.name} size="md" mr={3} />
        )}

        {/* Product Details */}
        <Box flex="1">
          <Text fontWeight="bold" color={textColor} fontSize="md">
            {product.name}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            {(product.price.includes("₹") ? "" : "₹")}
            {product.price}
          </Text>
        </Box>

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
            >
              {product.variationType}
            </MenuButton>
            <MenuList maxH="400px" overflowY="auto" p={2}>
              {product.variations.map((variation) => {
                const key = getVariationKey(product.id, variation._id);
                return (
                  <MenuItem
                    key={variation._id}
                    justifyContent="space-between"
                    // eslint-disable-next-line
                    _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                    p={2}
                  >
                    <Text fontSize="sm">
                      {variation.name} - ₹{variation.price}
                    </Text>
                    <Flex align="center">
                      <IconButton
                        size="xs"
                        aria-label="Decrease"
                        icon={<Text>-</Text>}
                        onClick={() => removeFromCart(product.id, variation._id)}
                        isDisabled={!cart[key]}
                        bg="transparent"
                        // eslint-disable-next-line
                        _hover={{ bg: useColorModeValue("gray.200", "gray.500") }}
                      />
                      <Text mx={2} fontSize="sm">
                        {cart[key]?.quantity || 0}
                      </Text>
                      <IconButton
                        size="xs"
                        aria-label="Increase"
                        icon={<Text>+</Text>}
                        onClick={() => addToCart(product, variation)}
                        bg="transparent"
                        // eslint-disable-next-line
                        _hover={{ bg: useColorModeValue("gray.200", "gray.500") }}
                      />
                    </Flex>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        ) : (
          <Flex align="center">
            <IconButton
              size="sm"
              aria-label="Decrease"
              icon={<Text>-</Text>}
              onClick={() => removeFromCart(product.id)}
              isDisabled={!cart[product.id]}
              bg="transparent"
              // eslint-disable-next-line
              _hover={{ bg: useColorModeValue("gray.200", "gray.500") }}
            />
            <Text mx={2} fontSize="sm">
              {cart[product.id]?.quantity || 0}
            </Text>
            <IconButton
              size="sm"
              aria-label="Increase"
              icon={<Text>+</Text>}
              onClick={() => addToCart(product)}
              bg="transparent"
              // eslint-disable-next-line
              _hover={{ bg: useColorModeValue("gray.200", "gray.500") }}
            />
          </Flex>
        )}
      </Flex>

      {/* Total Quantity and Price */}
      <Flex
        direction="row"
        justifyContent="space-between"
        mt={2}
        fontSize="sm"
        opacity={isProductInCart ? 1 : 0}
        transition="opacity 0.2s"
        height="24px" // Fixed height to reserve space
      >
        <Text fontWeight="bold">Total Items: {getTotalQuantity()}</Text>
        <Text fontWeight="bold">
          Total Price: ₹
          {Object.values(cart)
            .filter((item) => item.product.id === product.id)
            .reduce(
              (sum, item) =>
                sum + (item.selectedVariation?.price || item.product.price) * item.quantity,
              0
            )}
        </Text>
      </Flex>
    </Box>
  );
}