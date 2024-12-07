import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token missing",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    try {
      const decode = jwt.verify(token, jwtSecret) as string | JwtPayload;
      req.existUser = decode;
    } catch (error: unknown) {
      return res.status(401).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying the token",
      });
    }

    next();
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unauthorized",
    });
  }
};
