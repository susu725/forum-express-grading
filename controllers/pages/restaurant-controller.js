const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    const { id } = req.params
    return Promise.all([
      Restaurant.findByPk(id, { include: [Category, { model: Comment, include: User }, { model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikedUsers' }] }),
      Restaurant.increment({ view_counts: 1 }, { where: { id } })
    ])
      .then(([restaurant, viewCounts]) => {
        if (!restaurant) throw new Error('Restaurant didnt exist!')
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    const { id } = req.params
    return Restaurant.findByPk(id, { raw: true, nest: true, include: Category }).then(restaurant => {
      if (!restaurant) throw new Error('Restaurant didnt exist!')
      return res.render('dashboard', { restaurant })
    })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({ limit: 10, order: [['createdAt', 'DESC']], include: [Category], raw: true, nest: true }),
      Comment.findAll({ limit: 10, order: [['createdAt', 'DESC']], include: [User, Restaurant], raw: true, nest: true })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
