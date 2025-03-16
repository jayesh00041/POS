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
  const { cart, addToCart, removeFromCart } = useCart();

  const getVariationKey = (productId, variationId) =>
    variationId ? `${productId}-${variationId}` : `${productId}`;

  const getTotalQuantity = () =>
    Object.values(cart).reduce((sum, item) =>
      item.product.id === product.id ? sum + item.quantity : sum, 0);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bgColor={boxBg} width="100%">
      <Flex align="center" justify="space-between">
        {product.imageUrl ? (
          <Image src={product.imageUrl} boxSize="50px" borderRadius="full" mr={3} />
        ) : (
          <Avatar name={product.name} size="md" mr={3} />
        )}

        <Box flex="1">
          <Text fontWeight="bold" color={textColor}>{product.name}</Text>
          <Text fontSize="sm" color={textColorSecondary}>{(product.price.includes("₹") ? "" : "₹")}{product.price}</Text>
        </Box>

        {product.variations?.length > 0 ? (
          <Menu closeOnSelect={false}>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
            {product.variationType}
          </MenuButton>
          <MenuList maxH="400px" overflowY="auto">
            <Box sx={{ columnCount: { base: 1, md: 2, lg: 2 }, columnGap: "16px" }}>
              {product.variations.map((variation) => {
                const key = getVariationKey(product.id, variation._id);
                return (
                  <MenuItem key={variation._id} justifyContent="space-between">
                    <Text>
                      {variation.name} - ₹{variation.price}
                    </Text>
                    <Flex align="center">
                      <IconButton
                        size="xs"
                        aria-label="Decrease"
                        icon={<Text>-</Text>}
                        onClick={() => removeFromCart(product.id, variation._id)}
                        isDisabled={!cart[key]}
                      />
                      <Text mx={2}>{cart[key]?.quantity || 0}</Text>
                      <IconButton
                        size="xs"
                        aria-label="Increase"
                        icon={<Text>+</Text>}
                        onClick={() => addToCart(product, variation)}
                      />
                    </Flex>
                  </MenuItem>
                );
              })}
            </Box>
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
            />
            <Text mx={2}>{cart[product.id]?.quantity || 0}</Text>
            <IconButton
              size="sm"
              aria-label="Increase"
              icon={<Text>+</Text>}
              onClick={() => addToCart(product)}
            />
          </Flex>
        )}
      </Flex>

      {getTotalQuantity() > 0 && (
        <Flex direction="row" justifyContent="space-between" mt={2}>
          <Text fontSize="sm" fontWeight="bold">Total Items: {getTotalQuantity()}</Text>
          <Text fontSize="sm" fontWeight="bold">
            Total Price: ₹{
              Object.values(cart)
                .filter((item) => item.product.id === product.id)
                .reduce((sum, item) => sum + (item.selectedVariation?.price || item.product.price) * item.quantity, 0)
            }
          </Text>
        </Flex>
      )}
    </Box>
  );
}
