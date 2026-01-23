import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImageFromDataUrl = async (dataUrl, folder = "restroflow/qr-codes") => {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    overwrite: false,
  })

  return result
}

export default cloudinary

