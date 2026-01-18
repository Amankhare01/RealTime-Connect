import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
}
