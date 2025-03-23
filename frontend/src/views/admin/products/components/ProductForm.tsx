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
  Icon,
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";
import { addOrUpdateProduct } from "http-routes";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getCategories } from "http-routes";

const ProductForm = ({ isOpen, onClose, product, setProducts }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [counterNo, setCounterNo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [variationType, setVariationType] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [variations, setVariations] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [lastEnteredPrice, setLastEnteredPrice] = useState(""); // Track last entered price

  const toast = useToast();

  const getCategoriesMutation = useMutation({
    mutationFn: () => getCategories(),
    onSuccess: (data: any) => {
      const resCategories = data.data.data;
      setCategories(resCategories);
      const category = product
        ? resCategories.find((cat) => cat._id === product.categoryId)
        : resCategories.length > 0
        ? resCategories[0]
        : null;
      setSelectedCategory(category);
      if (category) {
        setCounterNo(category?.counterNo);
      }
    },
    onError: (error) => {
      enqueueSnackbar("Error fetching categories:", { variant: "error" });
    },
  });

  useEffect(() => {
    getCategoriesMutation.mutate();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setName(product?.name || "");
    setPrice(product?.price || "");
    setCounterNo(product?.counterNo || "");
    setImageUrl(product?.imageUrl || "");
    setSelectedCategory(product?.categoryId || "");
    setVariationType(product?.variationType || "");
    setVariations(product?.variations || []);
    setLastEnteredPrice(product?.price || ""); // Set last entered price
  }, [product]);

  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    const category = categories.find((cat) => cat._id === selectedCategoryId);
    setSelectedCategory(category);
    const associatedCounter = category.counterNo || "";
    setCounterNo(associatedCounter);
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    setVariations(updatedVariations);
  };

  const addVariation = () => {
    setVariations([...variations, { name: "", price: lastEnteredPrice || price || "" }]); // Default price set to last entered price
  };

  const removeVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file); // Store the file for submission
      setImageUrl(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSubmit = () => {
    if (!name || !price || !selectedCategory || !counterNo) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    if (product?._id) formData.append("id", product._id);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("counterNo", counterNo);
    formData.append("categoryId", selectedCategory._id);
    formData.append("variationType", variationType);
    formData.append("variations", JSON.stringify(variations));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    addOrUpdateProductMutation.mutate(formData);
    onClose();
  };

  const addOrUpdateProductMutation = useMutation({
    mutationFn: (reqData: any) => addOrUpdateProduct(reqData),
    onSuccess: (response: any) => {
      setProducts((prev) => {
        if (product?._id) {
          return prev.map((p) => (p._id === product._id ? response.data.data : p));
        } else {
          return [...prev, response.data.data];
        }
      });
      enqueueSnackbar(response.data.message, { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Error adding/updating product", { variant: "error" });
    },
  });

  // Check if all required fields are filled
  const isFormValid = 
    name && 
    selectedCategory && 
    counterNo && 
    ((variations?.length > 0) ? variations.every((variation) => variation.name && variation.price) : price);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{product ? "Edit Product" : "Add Product"}</ModalHeader>
        <ModalCloseButton size="sm" />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            {/* Image Upload */}
            <Box display="flex" alignItems="center">
              <Avatar size="md" src={imageUrl} name={name} mr={3} />
              <Input type="file" accept="image/*" onChange={handleImageChange} size="sm" padding="2px 5px" />
            </Box>

            {/* Product Name */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Product Name</FormLabel>
              <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>

            {/* Price */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Price (₹)</FormLabel>
              <Input
                type="number"
                min="0"
                size="sm"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setLastEnteredPrice(e.target.value); // Update last entered price
                }}
              />
            </FormControl>

            {/* Category */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Category</FormLabel>
              <Select
                size="sm"
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
                placeholder="Select value"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Counter No. */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Counter No.</FormLabel>
              <Input
                type="number"
                size="sm"
                value={counterNo}
                onChange={(e) => setCounterNo(e.target.value)}
              />
            </FormControl>

            {/* Variation Type */}
            <FormControl>
              <FormLabel fontSize="sm">Variation Type</FormLabel>
              <Input
                size="sm"
                value={variationType}
                onChange={(e) => setVariationType(e.target.value)}
              />
            </FormControl>

            {/* Variations Section */}
            <FormControl>
              <FormLabel fontSize="sm">Product Variations</FormLabel>
              {variations.map((variation, index) => (
                <Box key={index} display="flex" gap={2} alignItems="center">
                  <Input
                    size="sm"
                    placeholder="Variation Name"
                    value={variation.name}
                    onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                  />
                  <Input
                    type="number"
                    size="sm"
                    placeholder="Price (₹)"
                    value={variation.price}
                    onChange={(e) => handleVariationChange(index, "price", e.target.value)}
                  />
                  <Icon
                    as={MdDelete as React.ElementType}
                    color="red.500"
                    cursor="pointer"
                    onClick={() => removeVariation(index)}
                  />
                </Box>
              ))}
              <Button
                mt={2}
                size="sm"
                colorScheme="green"
                leftIcon={<AddIcon />}
                onClick={addVariation}
              >
                Add Variation
              </Button>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleSubmit}
            isDisabled={!isFormValid}
          >
            {product ? "Update" : "Add"}
          </Button>
          <Button size="sm" ml={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductForm;