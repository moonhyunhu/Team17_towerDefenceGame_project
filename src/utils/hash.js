import bcrypt from 'bcryptjs';

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 8);
};

export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};
