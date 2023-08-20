const { Restaurant, Category } = require('../models')

const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    const { id } = req.params
    Restaurant.findByPk(id).then(restaurant => {
      if (!restaurant) {
        const err = new Error('Restaurant didnt exist!')
        err.status = 404
        throw err
      }
      return restaurant.destroy()
    })
      .then(deleteRestaurant => cb(null, { restaurant: deleteRestaurant }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    imgurFileHandler(file)
      .then(filePath => Restaurant.create({ name, tel, address, openingHours, description, categoryId, image: filePath || null }))
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  }
}

module.exports = adminController
