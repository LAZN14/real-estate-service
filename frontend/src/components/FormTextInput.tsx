import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { useFormField } from '../form';

interface FormTextInputProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: string;
  label: string;
}

export function FormTextInput({ name, label, ...inputProps }: FormTextInputProps) {
  const field = useFormField<string>(name);

  return (
    <FormControl isInvalid={Boolean(field.error)} mb={4}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input
        id={name}
        name={field.name}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        {...inputProps}
      />
      {field.error && <FormErrorMessage>{field.error}</FormErrorMessage>}
    </FormControl>
  );
}
