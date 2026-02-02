import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const restaurantSchema = new Schema(
  {
    restaurantName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
    },

    locations: [
      {
        locationName: {
          type: String,
          required: true,
          trim: true,
        },
        address: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        zipCode: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          required: true,
          trim: true,
          default: "USA",
        },
        phone: {
          type: String,
          trim: true,
        },
        totalTables: {
          type: Number,
          required: true,
        },
        tableQRCodes: [
          {
            tableNumber: {
              type: Number,
              required: true,
            },
            qrImageUrl: {
              type: String,
              required: true,
            },
            qrPublicId: {
              type: String,
            },
          },
        ],
        isActive: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String,
    },

    role: {
      type: String,
      enum: ["RESTAURANT"],
      default: "RESTAURANT",
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    approvedByAdmin: {
      type: Boolean,
      default: false,
    },

    approvedAt: {
      type: Date,
    },

    adminNotes: {
      type: String,
      trim: true,
    },

    subscription: {
      pricePerMonth: {
        type: Number,
        required: true,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },

      isActive: {
        type: Boolean,
        default: false,
      },
    },

    qrCodesGenerated: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    resetPasswordOTP: {
      type: String,
    },

    resetPasswordExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

restaurantSchema.pre("save", async function (next) {
  if (this.subscription && this.subscription.endDate) {
    if (new Date() > this.subscription.endDate) {
      this.subscription.isActive = false;
    }
  }
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

restaurantSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

restaurantSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      restaurantName: this.restaurantName,
      role: this.role,
      status: this.status,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

restaurantSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}

export const Restaurant = mongoose.model("Restaurant", restaurantSchema)
