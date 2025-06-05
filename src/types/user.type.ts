import { userRole } from "../enums/user.enum";

export interface userType {
  name: string;
  rollNo?: string;
  photo: string;
  department: string;
  year?: string;
  phoneNo: number;
  pswrd: string;
  role: userRole;
  issuedBook: Array<{
    _id: String;
    date: Date;
  }>;
  returnedBook: Array<{
    _id: String;
    date: Date;
  }>;
}
