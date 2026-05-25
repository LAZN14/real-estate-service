import { Box, Container, Heading } from '@chakra-ui/react';
import { PropertyForm } from './forms/PropertyForm';

export default function App() {
  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" size="lg" mb={6}>
        Сервис объявлений о недвижимости
      </Heading>
      <Box bg="white" p={6} borderRadius="md" boxShadow="md">
        <PropertyForm />
      </Box>
    </Container>
  );
}
