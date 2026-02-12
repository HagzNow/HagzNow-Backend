import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'PasswordsNotSame', async: false })
export class PasswordsNotSameConstraint
  implements ValidatorConstraintInterface
{
  validate(newPassword: string, args: ValidationArguments) {
    const object: any = args.object;
    return newPassword !== object.oldPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return 'errors.auth.passwords_do_not_match';
  }
}

/**
 * 🔐 Reset Password DTO
 */
export class ChangePasswordDto {
  @ApiProperty({ description: 'The current password of the user' })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description:
      'The new password (must be strong and different from the old one)',
  })
  @IsString()
  @Length(8, 20, {
    message: 'Password must be between 8 and 20 characters',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @Validate(PasswordsNotSameConstraint)
  newPassword: string;
}
