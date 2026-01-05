import { ApiError } from "./ApiError.js"

export const generateAccessAndRefreshTokens = async (model, userId) => {
  try {
    const user = await model.findById(userId)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Token generation failed")
  }
}
