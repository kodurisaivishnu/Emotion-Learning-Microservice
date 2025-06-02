import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
};

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     let user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // res.json({ token });
//     res.cookie('token', token, {
//       httpOnly: true,       // Prevent JavaScript access (for security)
//       secure: process.env.NODE_ENV === 'production', // true in HTTPS
//       sameSite: 'Strict',   // or 'Lax'/'None' based on your use case
//       maxAge: 60 * 60 * 1000, // 1 hour
//     })
//     .json({ msg: 'Login successful' });

//   } catch (err) {
//     res.status(500).send('Server error');
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in cookie (optional if you use cookies)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Send back the user data as JSON
    res.status(200).json({
      msg: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token  // optional, in case you use it in client headers
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};



export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // set to true in production (HTTPS)
      sameSite: 'Lax' // or 'None' if cross-site
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal server error during logout" });
  }
};


export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);  
  } catch (error) {
    console.log("Error in checkAuth:", error.message);
    res.status(500).json({ message: "Internal server error from checkAuth" });
  }
};
