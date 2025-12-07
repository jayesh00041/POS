import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  useColorModeValue,
  useToast,
  Grid,
  Center,
  Image,
  Icon,
} from '@chakra-ui/react';
import { MdCloudUpload } from 'react-icons/md';

export default function BrandSettings() {
  const bgColor = useColorModeValue('gray.50', 'navy.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const uploadBgColor = useColorModeValue('gray.100', 'navy.700');
  const uploadBgHoverColor = useColorModeValue('gray.200', 'navy.600');
  const hintTextColor = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const [brandSettings, setBrandSettings] = useState({
    logoUrl: '',
    brandName: '',
    brandDescription: '',
    brandEmail: '',
    brandPhone: '',
    brandAddress: '',
    brandCity: '',
    brandState: '',
    brandZipCode: '',
    brandCountry: '',
    primaryColor: '#3182CE',
    secondaryColor: '#718096',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    // Load brand settings from API/localStorage
    const savedSettings = localStorage.getItem('brandSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setBrandSettings(settings);
      if (settings.logoUrl) {
        setLogoPreview(settings.logoUrl);
      }
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    setBrandSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please upload an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size should be less than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        handleChange('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        handleChange('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSave = async () => {
    if (!brandSettings.brandName.trim()) {
      toast({
        title: 'Error',
        description: 'Brand name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // API call would go here
      // await updateBrandSettings(brandSettings);
      localStorage.setItem('brandSettings', JSON.stringify(brandSettings));
      toast({
        title: 'Success',
        description: 'Brand settings updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update brand settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing="24px" align="stretch">
      {/* Logo Upload */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Brand Logo
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack spacing="20px" align="stretch">
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              bg={uploadBgColor}
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p="40px"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ borderColor: 'brand.500', bg: uploadBgHoverColor }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
                id="logo-upload"
              />
              <label htmlFor="logo-upload" style={{ cursor: 'pointer', width: '100%' }}>
                <Center flexDirection="column" cursor="pointer">
                  <Icon as={MdCloudUpload as React.ElementType} w={12} h={12} mb="12px" color="brand.500" />
                  <Text fontWeight="600" color={textColor} mb="4px">
                    Drag and drop your logo here
                  </Text>
                  <Text fontSize="sm" color={hintTextColor}>
                    or click to select a file (Max 5MB)
                  </Text>
                </Center>
              </label>
            </Box>

            {logoPreview && (
              <Center>
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  maxH="200px"
                  maxW="200px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                />
              </Center>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Brand Information */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Brand Information
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack spacing="16px" align="stretch">
            <FormControl isRequired>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Brand Name
              </FormLabel>
              <Input
                placeholder="Your business name"
                value={brandSettings.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: 'brand.500' }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Brand Description
              </FormLabel>
              <Textarea
                placeholder="Describe your business"
                value={brandSettings.brandDescription}
                onChange={(e) => handleChange('brandDescription', e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: 'brand.500' }}
                minH="100px"
              />
            </FormControl>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={brandSettings.brandEmail}
                  onChange={(e) => handleChange('brandEmail', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Phone Number
                </FormLabel>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={brandSettings.brandPhone}
                  onChange={(e) => handleChange('brandPhone', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Address Information */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Address
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack spacing="16px" align="stretch">
            <FormControl>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Street Address
              </FormLabel>
              <Input
                placeholder="Street address"
                value={brandSettings.brandAddress}
                onChange={(e) => handleChange('brandAddress', e.target.value)}
                borderColor={borderColor}
                _focus={{ borderColor: 'brand.500' }}
              />
            </FormControl>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  City
                </FormLabel>
                <Input
                  placeholder="City"
                  value={brandSettings.brandCity}
                  onChange={(e) => handleChange('brandCity', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  State/Province
                </FormLabel>
                <Input
                  placeholder="State"
                  value={brandSettings.brandState}
                  onChange={(e) => handleChange('brandState', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  ZIP/Postal Code
                </FormLabel>
                <Input
                  placeholder="ZIP code"
                  value={brandSettings.brandZipCode}
                  onChange={(e) => handleChange('brandZipCode', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="600" mb="8px">
                  Country
                </FormLabel>
                <Input
                  placeholder="Country"
                  value={brandSettings.brandCountry}
                  onChange={(e) => handleChange('brandCountry', e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </FormControl>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Brand Colors */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color={textColor}>
            Brand Colors
          </Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
            <FormControl>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Primary Color
              </FormLabel>
              <HStack spacing="12px">
                <Input
                  type="color"
                  value={brandSettings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  w="80px"
                  h="40px"
                  borderColor={borderColor}
                />
                <Input
                  value={brandSettings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#3182CE"
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel color={textColor} fontWeight="600" mb="8px">
                Secondary Color
              </FormLabel>
              <HStack spacing="12px">
                <Input
                  type="color"
                  value={brandSettings.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  w="80px"
                  h="40px"
                  borderColor={borderColor}
                />
                <Input
                  value={brandSettings.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder="#718096"
                  borderColor={borderColor}
                  _focus={{ borderColor: 'brand.500' }}
                />
              </HStack>
            </FormControl>
          </Grid>
        </CardBody>
      </Card>

      {/* Save Button */}
      <HStack justify="flex-end" spacing="12px">
        <Button
          variant="ghost"
          onClick={() => {
            const savedSettings = localStorage.getItem('brandSettings');
            if (savedSettings) {
              const settings = JSON.parse(savedSettings);
              setBrandSettings(settings);
              setLogoPreview(settings.logoUrl || null);
              setHasChanges(false);
            }
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          isLoading={isLoading}
          isDisabled={!hasChanges}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </HStack>
    </VStack>
  );
}
