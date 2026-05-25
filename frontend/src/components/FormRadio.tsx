import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { useFormField } from '../form';

export interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioProps {
  name: string;
  label: string;
  options: RadioOption[];
}

/**
 * Radio, привязанный к Formik через useFormField — без ручных onChange/onBlur.
 */
export function FormRadio({ name, label, options }: FormRadioProps) {
  const field = useFormField<string>(name);

  return (
    <FormControl isInvalid={Boolean(field.error)} mb={4}>
      <FormLabel>{label}</FormLabel>
      <RadioGroup
        name={field.name}
        value={field.value ?? ''}
        onChange={(value) => field.setValue(value)}
        onBlur={() => field.setTouched(true)}
      >
        <Stack direction="row" spacing={4}>
          {options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
      {field.error && <FormErrorMessage>{field.error}</FormErrorMessage>}
    </FormControl>
  );
}
