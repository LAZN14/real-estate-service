import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputProps,
} from '@chakra-ui/react';
import { ChangeEvent } from 'react';
import { useFormField } from '../form';

interface FormNumberInputProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  name: string;
  label: string;
}

export function FormNumberInput({ name, label, ...numberProps }: FormNumberInputProps) {
  const field = useFormField<number | ''>(name);

  const handleChange = (_valueAsString: string, valueAsNumber: number) => {
    field.setValue(Number.isNaN(valueAsNumber) ? '' : valueAsNumber);
  };

  const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
    field.onBlur(event);
  };

  return (
    <FormControl isInvalid={Boolean(field.error)} mb={4}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <NumberInput
        id={name}
        value={field.value === '' || field.value === undefined ? '' : field.value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...numberProps}
      >
        <NumberInputField name={field.name} />
      </NumberInput>
      {field.error && <FormErrorMessage>{field.error}</FormErrorMessage>}
    </FormControl>
  );
}
