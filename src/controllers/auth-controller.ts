import db from "../lib/db";
import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import { registerSchema } from "../schema/register";
import { loginSchema } from "../schema/login";
import { uploadImageToCloudinary } from "../lib/upload-image";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.safeParse(req.body);

    if (!req.files || !req.files.profileImgUrl || !req.files.backImgUrl) {
      res.status(400).json({
        success: false,
        message: "Files are missing",
      });
      return;
    }

    console.log("1", req.files);

    const profileImgFile = Array.isArray(req.files.profileImgUrl)
      ? req.files.profileImgUrl[0]
      : req.files.profileImgUrl;

    console.log("2", profileImgFile);

    const backImgFile = Array.isArray(req.files.backImgUrl)
      ? req.files.backImgUrl[0]
      : req.files.backImgUrl;

    console.log("3", backImgFile);

    if (!profileImgFile.tempFilePath || !backImgFile.tempFilePath) {
      res.status(400).json({
        success: false,
        message: "Invalid file upload",
      });
      return;
    }

    if (!validatedData.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
      return;
    }

    const { name, userName, email, password, bio, dateOfBirth } =
      validatedData.data;

    const uploadProfileImgUrl = await uploadImageToCloudinary({
      file: { tempFilePath: profileImgFile.tempFilePath },
      folder: process.env.FOLDER_NAME!,
    });

    console.log("4", uploadProfileImgUrl);

    const uploadBackImgUrl = await uploadImageToCloudinary({
      file: { tempFilePath: backImgFile.tempFilePath },
      folder: process.env.FOLDER_NAME!,
    });

    console.log("5", uploadBackImgUrl);

    const existUser = await db.user.findUnique({
      where: { email },
    });

    if (existUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
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
        profileImgUrl: uploadProfileImgUrl.secure_url,
        backImgUrl: uploadBackImgUrl.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
      return;
    }

    const { email, password } = validatedData.data;

    const existUser = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!existUser) {
      res.status(404).json({
        success: false,
        message: "User does not exist",
      });
      return;
    }

    // `existUser` is confirmed to exist at this point
    const decodePassword = await bcrypt.compare(password, existUser.password);

    if (!decodePassword) {
      res.status(401).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    const payload = {
      userId: existUser.id, // `existUser.id` is now safe to access
      email: existUser.email,
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      existUser,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};
