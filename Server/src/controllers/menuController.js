import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Menu } from "../models/menuModel.js"
import { Restaurant } from "../models/restaurantModel.js"
import cloudinary from "../utils/cloudinary.js"

const getMenu = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id

  let menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    menu = await Menu.create({
      restaurantId,
      globalMenu: {
        categories: [],
        items: [],
      },
      locationMenus: [],
    })
  }

  return res.status(200).json(
    new ApiResponse(200, menu, "Menu fetched successfully")
  )
})

const addCategory = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { name, order } = req.body

  if (!name || !name.trim()) {
    throw new ApiError(400, "Category name is required")
  }

  let menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    menu = await Menu.create({
      restaurantId,
      globalMenu: {
        categories: [],
        items: [],
      },
      locationMenus: [],
    })
  }

  const categoryExists = menu.globalMenu.categories.some(
    (cat) => cat.name.toLowerCase() === name.trim().toLowerCase()
  )

  if (categoryExists) {
    throw new ApiError(400, "Category already exists")
  }

  menu.globalMenu.categories.push({
    name: name.trim(),
    order: order || menu.globalMenu.categories.length,
  })

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Category added successfully")
  )
})

const updateCategory = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { categoryId } = req.params
  const { name, order } = req.body

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  const category = menu.globalMenu.categories.id(categoryId)
  if (!category) {
    throw new ApiError(404, "Category not found")
  }

  if (name && name.trim()) {
    const categoryExists = menu.globalMenu.categories.some(
      (cat) =>
        cat._id.toString() !== categoryId &&
        cat.name.toLowerCase() === name.trim().toLowerCase()
    )

    if (categoryExists) {
      throw new ApiError(400, "Category name already exists")
    }

    category.name = name.trim()
  }

  if (order !== undefined) {
    category.order = order
  }

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Category updated successfully")
  )
})

const deleteCategory = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { categoryId } = req.params

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  const category = menu.globalMenu.categories.id(categoryId)
  if (!category) {
    throw new ApiError(404, "Category not found")
  }

  const categoryName = category.name

  menu.globalMenu.items = menu.globalMenu.items.filter(
    (item) => item.category !== categoryName
  )

  menu.locationMenus.forEach((locationMenu) => {
    locationMenu.customItems = locationMenu.customItems.filter(
      (item) => item.category !== categoryName
    )
  })

  menu.globalMenu.categories = menu.globalMenu.categories.filter(
    (cat) => cat._id.toString() !== categoryId
  )

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Category and all its items deleted successfully")
  )
})

const addMenuItem = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { name, description, price, category, image } = req.body

  if (!name || !name.trim()) {
    throw new ApiError(400, "Item name is required")
  }

  if (!price || price < 0) {
    throw new ApiError(400, "Valid price is required")
  }

  if (!category || !category.trim()) {
    throw new ApiError(400, "Category is required")
  }

  let menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    menu = await Menu.create({
      restaurantId,
      globalMenu: {
        categories: [],
        items: [],
      },
      locationMenus: [],
    })
  }

  const categoryExists = menu.globalMenu.categories.some(
    (cat) => cat.name.toLowerCase() === category.trim().toLowerCase()
  )

  if (!categoryExists) {
    menu.globalMenu.categories.push({
      name: category.trim(),
      order: menu.globalMenu.categories.length,
    })
  }

  let imageUrl = ""
  let imagePublicId = ""

  if (image) {
    try {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: `restaurants/${restaurantId}/menu`,
        resource_type: "image",
      })
      imageUrl = uploadResult.secure_url
      imagePublicId = uploadResult.public_id
    } catch (error) {
      console.error("Image upload error:", error)
      throw new ApiError(400, "Failed to upload image")
    }
  }

  const newItem = {
    name: name.trim(),
    description: description?.trim() || "",
    price: parseFloat(price),
    category: category.trim(),
    image: {
      url: imageUrl,
      publicId: imagePublicId,
    },
    isAvailable: true,
  }

  menu.globalMenu.items.push(newItem)
  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Menu item added successfully")
  )
})

const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { itemId } = req.params
  const { name, description, price, category, image, isAvailable } = req.body

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  const item = menu.globalMenu.items.id(itemId)
  if (!item) {
    throw new ApiError(404, "Menu item not found")
  }

  if (name && name.trim()) {
    item.name = name.trim()
  }

  if (description !== undefined) {
    item.description = description?.trim() || ""
  }

  if (price !== undefined && price >= 0) {
    item.price = parseFloat(price)
  }

  if (category && category.trim()) {
    const categoryExists = menu.globalMenu.categories.some(
      (cat) => cat.name.toLowerCase() === category.trim().toLowerCase()
    )

    if (!categoryExists) {
      menu.globalMenu.categories.push({
        name: category.trim(),
        order: menu.globalMenu.categories.length,
      })
    }

    item.category = category.trim()
  }

  if (isAvailable !== undefined) {
    item.isAvailable = isAvailable
  }

  if (image) {
    if (item.image.publicId) {
      try {
        await cloudinary.uploader.destroy(item.image.publicId)
      } catch (error) {
        console.error("Error deleting old image:", error)
      }
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: `restaurants/${restaurantId}/menu`,
        resource_type: "image",
      })
      item.image.url = uploadResult.secure_url
      item.image.publicId = uploadResult.public_id
    } catch (error) {
      console.error("Image upload error:", error)
      throw new ApiError(400, "Failed to upload image")
    }
  }

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Menu item updated successfully")
  )
})

const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { itemId } = req.params

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  const item = menu.globalMenu.items.id(itemId)
  if (!item) {
    throw new ApiError(404, "Menu item not found")
  }

  if (item.image.publicId) {
    try {
      await cloudinary.uploader.destroy(item.image.publicId)
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  menu.globalMenu.items = menu.globalMenu.items.filter(
    (item) => item._id.toString() !== itemId
  )

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Menu item deleted successfully")
  )
})

const getLocationMenu = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { locationId } = req.params
  const { forCustomer } = req.query

  const restaurant = await Restaurant.findById(restaurantId)
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  const location = restaurant.locations.find(
    (loc) => loc._id.toString() === locationId
  )

  if (!location) {
    throw new ApiError(404, "Location not found")
  }

  let menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    menu = await Menu.create({
      restaurantId,
      globalMenu: {
        categories: [],
        items: [],
      },
      locationMenus: [],
    })
  }

  let locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  if (!locationMenu) {
    locationMenu = {
      locationId,
      hiddenItems: [],
      customItems: [],
      customCategories: [],
    }
    menu.locationMenus.push(locationMenu)
    await menu.save()
  }

  let globalItems = menu.globalMenu.items.map((item) => {
    const itemObj = item.toObject()
    const isHidden = locationMenu.hiddenItems.includes(item._id.toString())
    return {
      ...itemObj,
      isGlobal: true,
      isHidden: isHidden,
    }
  })

  if (forCustomer === 'true') {
    globalItems = globalItems.filter(item => !item.isHidden)
  }

  const locationItems = locationMenu.customItems.map((item) => {
    const itemObj = item.toObject()
    const isHidden = locationMenu.hiddenItems.includes(item._id.toString())
    return {
      ...itemObj,
      isGlobal: false,
      isHidden: isHidden,
    }
  })

  const allItems = [...globalItems, ...locationItems]

  const globalCategories = menu.globalMenu.categories.map((cat) => ({
    ...cat.toObject(),
    isGlobal: true,
  }))

  const locationCategories = locationMenu.customCategories.map((cat) => ({
    ...cat.toObject(),
    isGlobal: false,
  }))

  const allCategories = [...globalCategories, ...locationCategories]

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items: allItems,
        categories: allCategories,
        locationMenu,
      },
      "Location menu fetched successfully"
    )
  )
})

const hideItemFromLocation = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { locationId } = req.params
  const { itemId } = req.body

  if (!itemId) {
    throw new ApiError(400, "Item ID is required")
  }

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  let locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  if (!locationMenu) {
    locationMenu = {
      locationId,
      hiddenItems: [],
      customItems: [],
      customCategories: [],
    }
    menu.locationMenus.push(locationMenu)
  }

  // Check if it's a global item or location-specific item
  const globalItem = menu.globalMenu.items.id(itemId)
  const locationItem = locationMenu.customItems.id(itemId)

  if (!globalItem && !locationItem) {
    throw new ApiError(404, "Menu item not found")
  }

  if (!locationMenu.hiddenItems.includes(itemId)) {
    locationMenu.hiddenItems.push(itemId)
  }

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Item hidden from location successfully")
  )
})

const showItemInLocation = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { locationId } = req.params
  const { itemId } = req.body

  if (!itemId) {
    throw new ApiError(400, "Item ID is required")
  }

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  let locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  if (!locationMenu) {
    throw new ApiError(404, "Location menu not found")
  }

  locationMenu.hiddenItems = locationMenu.hiddenItems.filter(
    (id) => id !== itemId
  )

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Item shown in location successfully")
  )
})

const addLocationMenuItem = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { locationId } = req.params
  const { name, description, price, category, image } = req.body

  if (!name || !name.trim()) {
    throw new ApiError(400, "Item name is required")
  }

  if (!price || price < 0) {
    throw new ApiError(400, "Valid price is required")
  }

  if (!category || !category.trim()) {
    throw new ApiError(400, "Category is required")
  }

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  let locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  if (!locationMenu) {
    locationMenu = {
      locationId,
      hiddenItems: [],
      customItems: [],
      customCategories: [],
    }
    menu.locationMenus.push(locationMenu)
  }

  const categoryExists = locationMenu.customCategories.some(
    (cat) => cat.name.toLowerCase() === category.trim().toLowerCase()
  )

  if (!categoryExists) {
    locationMenu.customCategories.push({
      name: category.trim(),
      order: locationMenu.customCategories.length,
    })
  }

  let imageUrl = ""
  let imagePublicId = ""

  if (image) {
    try {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: `restaurants/${restaurantId}/menu/${locationId}`,
        resource_type: "image",
      })
      imageUrl = uploadResult.secure_url
      imagePublicId = uploadResult.public_id
    } catch (error) {
      console.error("Image upload error:", error)
      throw new ApiError(400, "Failed to upload image")
    }
  }

  const newItem = {
    name: name.trim(),
    description: description?.trim() || "",
    price: parseFloat(price),
    category: category.trim(),
    image: {
      url: imageUrl,
      publicId: imagePublicId,
    },
    isAvailable: true,
  }

  locationMenu.customItems.push(newItem)
  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Location menu item added successfully")
  )
})

const updateLocationMenuItem = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { locationId, itemId } = req.params
  const { name, description, price, category, image, isAvailable } = req.body

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  const locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  if (!locationMenu) {
    throw new ApiError(404, "Location menu not found")
  }

  const item = locationMenu.customItems.id(itemId)
  if (!item) {
    throw new ApiError(404, "Menu item not found")
  }

  if (name && name.trim()) {
    item.name = name.trim()
  }

  if (description !== undefined) {
    item.description = description?.trim() || ""
  }

  if (price !== undefined && price >= 0) {
    item.price = parseFloat(price)
  }

  if (category && category.trim()) {
    const categoryExists = locationMenu.customCategories.some(
      (cat) => cat.name.toLowerCase() === category.trim().toLowerCase()
    )

    if (!categoryExists) {
      locationMenu.customCategories.push({
        name: category.trim(),
        order: locationMenu.customCategories.length,
      })
    }

    item.category = category.trim()
  }

  if (isAvailable !== undefined) {
    item.isAvailable = isAvailable
  }

  if (image) {
    if (item.image.publicId) {
      try {
        await cloudinary.uploader.destroy(item.image.publicId)
      } catch (error) {
        console.error("Error deleting old image:", error)
      }
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: `restaurants/${restaurantId}/menu/${locationId}`,
        resource_type: "image",
      })
      item.image.url = uploadResult.secure_url
      item.image.publicId = uploadResult.public_id
    } catch (error) {
      console.error("Image upload error:", error)
      throw new ApiError(400, "Failed to upload image")
    }
  }

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Location menu item updated successfully")
  )
})

const deleteLocationMenuItem = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id
  const { locationId, itemId } = req.params

  const menu = await Menu.findOne({ restaurantId })

  if (!menu) {
    throw new ApiError(404, "Menu not found")
  }

  const locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  if (!locationMenu) {
    throw new ApiError(404, "Location menu not found")
  }

  const item = locationMenu.customItems.id(itemId)
  if (!item) {
    throw new ApiError(404, "Menu item not found")
  }

  if (item.image.publicId) {
    try {
      await cloudinary.uploader.destroy(item.image.publicId)
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  locationMenu.customItems = locationMenu.customItems.filter(
    (item) => item._id.toString() !== itemId
  )

  await menu.save()

  return res.status(200).json(
    new ApiResponse(200, menu, "Location menu item deleted successfully")
  )
})

const getPublicMenu = asyncHandler(async (req, res) => {
  const { restaurantId, locationId } = req.params

  const restaurant = await Restaurant.findById(restaurantId)
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found")
  }

  const location = restaurant.locations.find(
    (loc) => loc._id.toString() === locationId
  )

  if (!location) {
    throw new ApiError(404, "Location not found")
  }

  const menu = await Menu.findOne({ restaurantId })  
  if (!menu) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { items: [], categories: [], locationMenu: null, restaurantName: restaurant.restaurantName, locationName: location.locationName },
        "Menu fetched successfully"
      )
    )
  }

  let locationMenu = menu.locationMenus.find(
    (lm) => lm.locationId === locationId
  )

  let globalItems = menu.globalMenu.items.map((item) => {
    const itemObj = item.toObject()
    const isHidden = locationMenu ? locationMenu.hiddenItems.includes(item._id.toString()) : false
    return {
      ...itemObj,
      isGlobal: true,
      isHidden: isHidden,
    }
  })

  globalItems = globalItems.filter(item => !item.isHidden && item.isAvailable !== false)

  let locationItems = []
  if (locationMenu) {
    locationItems = locationMenu.customItems.map((item) => ({
      ...item.toObject(),
      isGlobal: false,
      isHidden: false,
    })).filter(item => item.isAvailable !== false)
  }

  const allItems = [...globalItems, ...locationItems]

  const globalCategories = menu.globalMenu.categories.map((cat) => ({
    ...cat.toObject(),
    isGlobal: true,
  }))

  const locationCategories = locationMenu ? locationMenu.customCategories.map((cat) => ({
    ...cat.toObject(),
    isGlobal: false,
  })) : []

  const allCategories = [...globalCategories, ...locationCategories]

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items: allItems,
        categories: allCategories,
        locationMenu,
        restaurantName: restaurant.restaurantName,
        locationName: location.locationName
      },
      "Public menu fetched successfully"
    )
  )
})

export {
  getMenu,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getLocationMenu,
  hideItemFromLocation,
  showItemInLocation,
  addLocationMenuItem,
  updateLocationMenuItem,
  deleteLocationMenuItem,
  getPublicMenu,
}
