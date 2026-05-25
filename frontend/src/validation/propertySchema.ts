import * as Yup from 'yup';

declare module 'yup' {
  interface NumberSchema {
    moreThanSumOfFields(
      fieldNames: string[],
      message?: string,
    ): this;
  }
}

Yup.setLocale({
  mixed: {
    required: 'Поле обязательно для заполнения',
  },
  number: {
    min: ({ min }) => `Значение не может быть меньше ${min}`,
    max: ({ max }) => `Значение не может быть больше ${max}`,
  },
});

Yup.addMethod(
  Yup.number,
  'moreThanSumOfFields',
  function moreThanSumOfFields(fieldNames: string[], message?: string) {
    return this.test('moreThanSumOfFields', message ?? '', function validate(value) {
      if (value === undefined || value === null) {
        return true;
      }

      const sum = fieldNames.reduce((acc, fieldName) => {
        const fieldValue = this.parent[fieldName];
        return acc + (typeof fieldValue === 'number' ? fieldValue : 0);
      }, 0);

      if (value > sum) {
        return true;
      }

      return this.createError({
        message:
          message ??
          'Значение должно быть больше суммы указанных полей',
      });
    });
  },
);

export interface PropertyFormValues {
  name: string;
  address: string;
  floor: number | '';
  totalFloors: number | '';
  square: number | '';
  livingSquare: number | '';
  kitchenSquare: number | '';
  propertyType: string;
  hasBalcony: boolean;
}

export const propertyFormInitialValues: PropertyFormValues = {
  name: '',
  address: '',
  floor: '',
  totalFloors: '',
  square: '',
  livingSquare: '',
  kitchenSquare: '',
  propertyType: '',
  hasBalcony: false,
};

const requiredNumber = () =>
  Yup.number()
    .typeError('Поле обязательно для заполнения')
    .required();

export const propertyFormSchema = Yup.object({
  name: Yup.string().required(),
  address: Yup.string().required(),
  totalFloors: requiredNumber().min(-3).max(200),
  floor: requiredNumber()
    .min(-1)
    .when('totalFloors', ([totalFloors], schema) => {
      if (typeof totalFloors === 'number') {
        return schema.max(
          totalFloors,
          `Значение не может быть больше ${totalFloors}`,
        );
      }
      return schema;
    }),
  livingSquare: requiredNumber().min(0),
  kitchenSquare: requiredNumber().min(0),
  square: requiredNumber()
    .min(0)
    .max(400)
    .moreThanSumOfFields(
      ['kitchenSquare', 'livingSquare'],
      'Общая площадь должна быть больше суммы жилой площади и площади кухни',
    ),
  propertyType: Yup.string().required(),
  hasBalcony: Yup.boolean(),
});

export { Yup };
