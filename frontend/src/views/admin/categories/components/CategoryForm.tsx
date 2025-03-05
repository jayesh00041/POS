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
import { useMutation } from "@tanstack/react-query";
import { addOrUpdateCategory } from "http-routes";
import { enqueueSnackbar } from "notistack";

const CategoryForm = ({ isOpen, onClose, category, setCategories }) => {
  const [name, setName] = useState("");
  const [counterNo, setCounterNo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setName(category?.name || "");
    setCounterNo(category?.counterNo || "");
    setImageUrl(category?.imageUrl || "");
  }, [category]);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file); // Store the file for submission
      setImageUrl(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    if (category?._id) formData.append("id", category._id);
    formData.append("name", name);
    formData.append("counterNo", counterNo);
    
    if (imageFile) {
        formData.append("image", imageFile); // Ensure key name matches backend
    }
    addOrUpdateCategoryMutation.mutate(formData);
    onClose();
};

  const addOrUpdateCategoryMutation = useMutation({
    mutationFn: (reqData: any) => addOrUpdateCategory(reqData), 
    onSuccess: (response: any) => {
      console.log(response);
      setCategories((prevCategories) => {
        if (category?._id) {
          return prevCategories.map((c) =>
            c._id === category._id ? response.data.data : c
          );
        } else {
          return [...prevCategories, response.data.data];
        }
      });
      enqueueSnackbar(response.data.message, { variant: "success" });
    },
    onError: (error) => {
      enqueueSnackbar("Error adding/updating category:", { variant: "error" });
    },
  });

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
