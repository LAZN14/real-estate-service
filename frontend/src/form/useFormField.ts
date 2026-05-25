import type { FieldInputProps, FieldMetaProps, FormikProps } from 'formik';
import { useFormikContext } from 'formik';
import { useMemo } from 'react';

export interface FormFieldBinding<T = unknown> {
  name: string;
  value: T;
  onChange: FieldInputProps<T>['onChange'];
  onBlur: FieldInputProps<T>['onBlur'];
  error?: string;
  touched: boolean;
  setValue: (value: T) => void;
  setTouched: (touched?: boolean) => void;
}

/**
 * Хук для привязки любого инпута к контексту Formik без ручного прописывания onChange/onBlur.
 */
export function useFormField<T = unknown>(name: string): FormFieldBinding<T> {
  const formik = useFormikContext<Record<string, unknown>>();

  const field = formik.getFieldProps(name);
  const meta = formik.getFieldMeta(name) as FieldMetaProps<unknown>;

  return useMemo(
    () => ({
      name: field.name,
      value: field.value as T,
      onChange: field.onChange,
      onBlur: field.onBlur,
      error: meta.touched && meta.error ? String(meta.error) : undefined,
      touched: Boolean(meta.touched),
      setValue: (value: T) => {
        void formik.setFieldValue(name, value);
      },
      setTouched: (touched = true) => {
        void formik.setFieldTouched(name, touched);
      },
    }),
    [field, formik, meta.error, meta.touched, name],
  );
}

export type FormValues = Record<string, unknown>;

export function useFormikForm<T extends FormValues>() {
  return useFormikContext<T>() as FormikProps<T>;
}
