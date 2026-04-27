import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config({})
const generateToken = async (userId: string) => {
  const secret = process.env.JWT
  if (!secret) {
    throw new Error('JWT secret is not defined')
  }

  return jwt.sign({ userId }, secret, { expiresIn: '1y' })
}
export default generateToken;