import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Avatar,
  Box,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";

const API_URL = process.env.REACT_APP_CATEGORY_API || "https://mocki.io/v1/17e723f5-948e-4b7b-b006-cca3459c3af5";

const ProductForm = ({ isOpen, onClose, product, setCategory, setProducts }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [counterNo, setCounterNo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [variations, setVariations] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    setName(product?.name || "");
    setPrice(product?.price || "");
    setCounterNo(product?.counterNo || "");
    setImageUrl(product?.imageUrl || "");
    setSelectedCategory(product?.category || "");
    setVariations(product?.variations || []);
  }, [product]);

  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    setSelectedCategory(selected);
    setCategory(selected);
    const associatedCounter = categories.find((cat) => cat.name === selected)?.counterNo || "";
    setCounterNo(associatedCounter);
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    setVariations(updatedVariations);
  };

  const addVariation = () => {
    setVariations([...variations, { name: "", price: price || 0 }]); // Default price set to main product price
  };

  const removeVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const newProduct = {
      id: product ? product.id : Date.now(),
      name,
      price,
      counterNo,
      imageUrl,
      category: selectedCategory,
      variations,
    };

    setProducts((prev) => (product ? prev.map((p) => (p.id === product.id ? newProduct : p)) : [...prev, newProduct]));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product ? "Edit Product" : "Add Product"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box display="flex" alignItems="center">
              <Avatar size="lg" src={imageUrl} name={name} mr={3} />
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </Box>
            <FormControl isRequired>
              <FormLabel>Product Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Price (₹)</FormLabel>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select value={selectedCategory} onChange={handleCategoryChange}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Counter No.</FormLabel>
              <Input type="number" value={counterNo} onChange={(e) => setCounterNo(e.target.value)} />
            </FormControl>

            {/* Variations Section */}
            <FormControl>
              <FormLabel>Product Variations</FormLabel>
              {variations.map((variation, index) => (
                <Box key={index} display="flex" gap={2} alignItems="center">
                  <Input
                    placeholder="Variation Name (e.g., Large, Extra Toppings)"
                    value={variation.name}
                    onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Price (₹)"
                    value={variation.price}
                    onChange={(e) => handleVariationChange(index, "price", e.target.value)}
                  />
                  <Icon as={MdDelete} colorScheme="red" size="sm" onClick={() => removeVariation(index)} />
                </Box>
              ))}
              <Button mt={2} colorScheme="green" leftIcon={<AddIcon />} onClick={addVariation}>
                Add Variation
              </Button>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {product ? "Update" : "Add"}
          </Button>
          <Button ml={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductForm;
