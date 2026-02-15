import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitOwnerVerificationDto {
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
