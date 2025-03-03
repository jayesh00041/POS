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
  VStack,
  Avatar,
  Box,
} from "@chakra-ui/react";

const CategoryForm = ({ isOpen, onClose, category, setCategories }) => {
  const [name, setName] = useState("");
  const [counterNo, setCounterNo] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setName(category?.name || "");
    setCounterNo(category?.counterNo || "");
    setImageUrl(category?.imageUrl || "");
  }, [category]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = () => {
    const newCategory = {
      id: category ? category.id : Date.now(),
      name,
      counterNo,
      imageUrl,
    };
    
    setCategories((prev) =>
      category ? prev.map((c) => (c.id === category.id ? newCategory : c)) : [...prev, newCategory]
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{category ? "Edit Category" : "Add Category"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box display="flex" alignItems="center">
              <Avatar size="lg" src={imageUrl} name={name} mr={3} />
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </Box>
            <FormControl isRequired>
              <FormLabel>Category Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Counter No.</FormLabel>
              <Input type="number" value={counterNo} onChange={(e) => setCounterNo(e.target.value)} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>{category ? "Update" : "Add"}</Button>
          <Button ml={3} onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CategoryForm;
