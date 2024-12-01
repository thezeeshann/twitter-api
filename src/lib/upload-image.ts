import { v2 as cloudinary } from "cloudinary";

type uploadImageToCloudinaryProp = {
  file: { tempFilePath: string }; 
  folder: string;
  height?: number;
  quality?: number | "auto"; 
};

export const uploadImageToCloudinary = async ({
  file,
  folder,
  height,
  quality,
}: uploadImageToCloudinaryProp) => {
  const options: Record<string, unknown> = { folder };

  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
