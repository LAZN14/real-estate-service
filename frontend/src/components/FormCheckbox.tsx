import { Checkbox, FormControl, FormErrorMessage } from '@chakra-ui/react';
import { useFormField } from '../form';

interface FormCheckboxProps {
  name: string;
  label: string;
}

/**
 * Checkbox, привязанный к Formik через useFormField — без ручных onChange/onBlur.
 */
export function FormCheckbox({ name, label }: FormCheckboxProps) {
  const field = useFormField<boolean>(name);

  return (
    <FormControl isInvalid={Boolean(field.error)} mb={4}>
      <Checkbox
        name={field.name}
        isChecked={Boolean(field.value)}
        onChange={(event) => field.setValue(event.target.checked)}
        onBlur={() => field.setTouched(true)}
      >
        {label}
      </Checkbox>
      {field.error && <FormErrorMessage>{field.error}</FormErrorMessage>}
    </FormControl>
  );
}
