import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ArrayUniqueBy<T>(
  property: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'arrayUniqueBy',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: T[], args: ValidationArguments) {
          if (!Array.isArray(value)) return true; // let @IsArray handle this
          const seen = new Set();
          for (const item of value) {
            const val = item[property];
            if (seen.has(val)) return false;
            seen.add(val);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains duplicate values`;
        },
      },
    });
  };
}
