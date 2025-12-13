import { CreateUserDto } from './create-user.dto';

export class CreateOwnerDto extends CreateUserDto {
  nationalIdFront: string;
  nationalIdBack: string;
  selfieWithId: string;
}
