import db from "../lib/db.js";
import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import { registerSchema } from "../schema/register.js";

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }

    const {
      name,
      userName,
      email,
      password,
      bio,
      dateOfBirth,
      profileImgUrl,
      backImgUrl,
    } = validatedData.data;

    const existUser = await db.user.findUnique({
      where: { email },
    });

    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        userName,
        email,
        password: hashPassword,
        bio,
        dateOfBirth,
        profileImgUrl,
        backImgUrl,
      },
    });

    return res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
