import { IsString, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateOwnerDto extends CreateUserDto {
  @IsOptional()
  @IsString()
  nationalIdFront?: string;

  @IsOptional()
  @IsString()
  nationalIdBack?: string;

  @IsOptional()
  @IsString()
  selfieWithId?: string;
}
