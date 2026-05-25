import { Button, Stack, useToast } from '@chakra-ui/react';
import { Form } from 'formik';
import {
  FormCheckbox,
  FormNumberInput,
  FormRadio,
  FormTextInput,
} from '../components';
import { FormProvider } from '../form';
import {
  propertyFormInitialValues,
  propertyFormSchema,
  PropertyFormValues,
} from '../validation/propertySchema';

const propertyTypeOptions = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Дом' },
  { value: 'room', label: 'Комната' },
];

export function PropertyForm() {
  const toast = useToast();

  const handleSubmit = (values: PropertyFormValues) => {
    toast({
      title: 'Объявление сохранено',
      description: `Объект «${values.name}» успешно отправлен`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <FormProvider<PropertyFormValues>
      initialValues={propertyFormInitialValues}
      validationSchema={propertyFormSchema}
      onSubmit={handleSubmit}
      validateOnBlur
      validateOnChange={false}
    >
      <Form noValidate>
        <FormTextInput name="name" label="Название объекта" />
        <FormTextInput name="address" label="Адрес" />

        <FormNumberInput name="totalFloors" label="Количество этажей в доме" />
        <FormNumberInput name="floor" label="Этаж" />

        <FormNumberInput name="square" label="Площадь" />
        <FormNumberInput name="livingSquare" label="Жилая площадь" />
        <FormNumberInput name="kitchenSquare" label="Площадь кухни" />

        <FormRadio
          name="propertyType"
          label="Тип недвижимости"
          options={propertyTypeOptions}
        />

        <FormCheckbox name="hasBalcony" label="Есть балкон" />

        <Stack direction="row" spacing={4} mt={4}>
          <Button type="submit" colorScheme="blue">
            Сохранить
          </Button>
        </Stack>
      </Form>
    </FormProvider>
  );
}
