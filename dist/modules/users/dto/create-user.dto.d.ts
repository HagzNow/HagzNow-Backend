import { UserRole } from '../interfaces/userRole.interface';
export declare class CreateUserDto {
    fName: string;
    lName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
}
