import { randomInt } from "crypto";

export const otpGenerator = (): string => {
  return randomInt(100000, 999999).toString();
};
