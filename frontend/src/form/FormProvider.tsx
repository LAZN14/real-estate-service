import { Formik, FormikConfig, FormikValues } from 'formik';
import { ReactNode } from 'react';

interface FormProviderProps<T extends FormikValues> extends FormikConfig<T> {
  children: ReactNode;
}

/**
 * Обёртка над Formik — единая точка входа для форм.
 * Дочерние поля подключаются через useFormField(name) без ручных обработчиков.
 */
export function FormProvider<T extends FormikValues>({
  children,
  ...config
}: FormProviderProps<T>) {
  return <Formik {...config}>{children}</Formik>;
}
