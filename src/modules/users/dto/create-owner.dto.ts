import { IsString, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateOwnerDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nationalIdFront: string;

  @IsString()
  @IsNotEmpty()
  nationalIdBack: string;

  @IsString()
  @IsNotEmpty()
  selfieWithId: string;
}
