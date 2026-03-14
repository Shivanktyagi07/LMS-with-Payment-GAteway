import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user_id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2d",
  });

  return res
    .json(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 48 * 60 * 60 * 1000, //2 days
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
