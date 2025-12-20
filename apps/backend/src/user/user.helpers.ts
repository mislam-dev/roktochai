export const randomPassword = (length: number) => {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let password = "";
  for (let i = 0; i <= length; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

export const nextRoleName = (name: "user" | "admin" | "super_admin") => {
  const nextRoleObject = {
    user: "admin",
    admin: "super_admin",
    super_admin: "super_admin",
  };

  return nextRoleObject[name];
};
export const prevRoleName = (name: "user" | "admin" | "super_admin") => {
  const prevRoleObject = {
    super_admin: "admin",
    admin: "user",
    user: "user",
  };

  return prevRoleObject[name];
};
