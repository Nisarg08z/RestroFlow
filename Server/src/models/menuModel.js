import mongoose, { Schema } from "mongoose"

const menuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const menuSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    
    globalMenu: {
      categories: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      items: [menuItemSchema],
    },
    locationMenus: [
      {
        locationId: {
          type: String,
          required: true,
        },
        hiddenItems: [
          {
            type: String,
          },
        ],
        customItems: [menuItemSchema],
        customCategories: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            order: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
)

menuSchema.index({ restaurantId: 1 })

export const Menu = mongoose.model("Menu", menuSchema)
