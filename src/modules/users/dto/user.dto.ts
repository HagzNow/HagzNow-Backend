import { Expose, Transform } from 'class-transformer';
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';
import { PayoutMethod } from '../interfaces/payout-method.interface';
import { getUploadUrl } from 'src/common/utils/upload-url.util';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  fName: string;

  @Expose()
  lName: string;

  @Expose()
  role: UserRole;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  status: UserStatus;

  @Expose()
  @Transform(({ value }) => getUploadUrl(value))
  avatar?: string;

  @Expose()
  payoutMethod: PayoutMethod;

  @Expose()
  @Transform(({ obj }) =>
    obj.role === UserRole.OWNER
      ? !!(
          obj.nationalIdFront &&
          obj.nationalIdBack &&
          obj.selfieWithId
        )
      : undefined,
  )
  verificationSubmitted?: boolean;

  @Expose()
  rejectionReason?: string;
}
