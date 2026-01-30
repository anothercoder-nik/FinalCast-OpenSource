import User from "../models/user.model.js";

export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

export const findUserByEmailByPassword = async (email) => {
    return await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select('+password +twoFactorSecret')
}
export const createUser = async (name, email, password) => {
    const newUser = new User({name, email, password})
    await newUser.save()
    return newUser
}
export const findUserById = async (id) => {
    return await User.findById(id);
}
