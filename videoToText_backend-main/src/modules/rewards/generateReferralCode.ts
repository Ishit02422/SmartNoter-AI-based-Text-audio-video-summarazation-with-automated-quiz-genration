import { getByReferCode } from "./getByReferCode";

export const generateReferralCode = async () => {
  let isUnique = false;
  while (!isUnique) {
    let referCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    let existingUser = await getByReferCode(referCode);
    if (!existingUser) {
      isUnique = true;
      return referCode;
    }
  }
};
