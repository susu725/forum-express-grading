const { Restaurant, Category } = require('../models')

const adminController = {
  getRestaurants: (req, cb) => {
    Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => cb(null, { restaurants }))
  }
}

module.exports = adminController
