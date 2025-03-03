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

export default function ItemComponent({ product }: { product: any }) {
  const boxBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");
  const { cart, addToCart, removeFromCart } = useCart();

  const getVariationKey = (productId: number, variationName: string) =>
    `${productId}-${variationName}`;

  const getTotal = () =>
    product.variations.length > 0
      ? product.variations.reduce(
          (sum, v) => sum + (cart[getVariationKey(product.id, v.name)]?.quantity || 0),
          0
        )
      : cart[product.id]?.quantity || 0;

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bgColor={boxBg} width="100%">
      <Flex align="center" justify="space-between">
        {product.image ? (
          <Image src={product.image} boxSize="50px" borderRadius="full" mr={3} />
        ) : (
          <Avatar name={product.name} size="md" mr={3} />
        )}

        <Box flex="1">
          <Text fontWeight="bold" color={textColor}>
            {product.name}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            {product.price}
          </Text>
        </Box>

        {product.variations.length > 0 ? (
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
              Variations
            </MenuButton>
            <MenuList>
              {product.variations.map((variation: any) => {
                const key = getVariationKey(product.id, variation.name);
                return (
                  <MenuItem key={variation.name} justifyContent="space-between">
                    <Text>
                      {variation.name} - ₹{variation.price}
                    </Text>
                    <Flex align="center">
                      <IconButton
                        size="xs"
                        aria-label="Decrease"
                        icon={<Text>-</Text>}
                        onClick={() => removeFromCart(product.id, variation.name)}
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
            </MenuList>
          </Menu>
        ) : (
          <Flex align="center">
            <IconButton
              size="sm"
              aria-label="Decrease"
              icon={<Text>-</Text>}
              onClick={() => removeFromCart(product.id, "")}
              isDisabled={!cart[product.id]}
            />
            <Text mx={2}>{cart[product.id]?.quantity || 0}</Text>
            <IconButton
              size="sm"
              aria-label="Increase"
              icon={<Text>+</Text>}
              onClick={() => addToCart(product, { name: "", price: parseInt(product.price) })}
            />
          </Flex>
        )}
      </Flex>

      {getTotal() > 0 && (
        <Flex direction='row' justifyContent='space-between'>
          <Text fontSize="sm" fontWeight="bold">Total Items: {getTotal()}</Text>
          <Text fontSize="sm" fontWeight="bold">
            Total Price: ₹
            {Object.values(cart)
              .filter((item) => item.product.id === product.id)
              .reduce((sum, item) => sum + item.selectedVariation.price * item.quantity, 0)}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
