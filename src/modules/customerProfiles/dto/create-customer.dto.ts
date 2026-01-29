export class CreateCustomerDto {
  fName: string;
  lName: string;
  phoneNumber: string;
  userId?: string; // optional link to User
}
