import { userRole } from "../types/enums/user.enum.js";

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
  refreshToken: string;
}
