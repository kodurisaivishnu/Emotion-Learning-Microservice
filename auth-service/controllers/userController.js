import User from '../models/User.js';

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId; // `userId` is attached by verifyAuth middleware
    const { email, role } = req.body;

    if (!email && !role) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const updatedFields = {};
    if (email) updatedFields.email = email;
    if (role) updatedFields.role = role;

    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.status(200).json({ message: 'User updated', user });
  } catch (error) {
    console.log("Error in updateUser:", error.message);
    res.status(500).json({ message: 'Internal server error : Email or role is missing' });
  }
};
