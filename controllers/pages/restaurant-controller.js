const { Restaurant, Category, Comment, User } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Promise.all([
      Restaurant.findAndCountAll({
        raw: true,
        nest: true,
        include: Category,
        where: { ...categoryId ? { categoryId } : {} },
        limit,
        offset
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const LikedRestaurantsId = req.user && req.user.LikedRestaurants.map(lk => lk.id)
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: LikedRestaurantsId.includes(r.id)
        }))
        return res.render('restaurants', { restaurants: data, categories, categoryId, pagination: getPagination(limit, page, restaurants.count) })
      })
      .catch(err => next(err))
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