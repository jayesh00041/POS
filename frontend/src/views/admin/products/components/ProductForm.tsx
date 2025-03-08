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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [variations, setVariations] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const getCategoriesMutation = useMutation({
    mutationFn: () => getCategories(),
    onSuccess: (data: any) => {
      const resCategories = data.data.data
      setCategories(resCategories);
      setSelectedCategory(product ? resCategories.find((cat) => cat._id === product.categoryId) : null);
      if(!product){
        setCounterNo(selectedCategory?.counterNo || "");
      }
    },
    onError(error) {
      enqueueSnackbar('Error fetching categories:', { variant: 'error' });
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
    setVariations(product?.variations || []);
  }, [product]);

  const handleCategoryChange = (event) => {
    const selectedCategryId = event.target.value;
    const category = categories.find((cat) => cat._id === selectedCategryId);
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
    setVariations([...variations, { name: "", price: price || 0 }]); // Default price set to main product price
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
    const formData = new FormData();
    if (product?._id) formData.append("id", product._id);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("counterNo", counterNo);
    formData.append("categoryId", selectedCategory._id);
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
              <Select value={selectedCategory?._id} onChange={handleCategoryChange}>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
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
                  <Icon as={MdDelete as React.ElementType} colorScheme="red" size="sm" onClick={() => removeVariation(index)} />
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
