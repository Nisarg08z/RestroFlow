import { ApiError } from "./ApiError.js"

export const generateAccessAndRefreshTokens = async (Model, userId) => {
  try {
    const user = await Model.findById(userId)

    if (!user) {
      throw new ApiError(404, "User not found for token generation")
    }

    if (
      typeof user.generateAccessToken !== "function" ||
      typeof user.generateRefreshToken !== "function"
    ) {
      throw new ApiError(500, "Token methods missing on model")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "JWT secrets missing or invalid")
    }

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    console.error("❌ generateAccessAndRefreshTokens error:", error.message)
    throw error
  }
}
