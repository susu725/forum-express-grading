const express = require('express')
const passport = require('passport')
const router = express.Router()

const restController = require('../../controllers/pages/restaurant-controller')
const userController = require('../../controllers/pages/user-controller')
const commentController = require('../../controllers/pages/comment-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')
const { generalErrorHandler } = require('../../middleware/error-handler')

const admin = require('./modules/admin')
router.use('/admin', authenticatedAdmin, admin)

// 用戶驗證
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true
}), userController.signIn)

router.get('/logout', userController.logout)

// 餐廳
router.get('/restaurants/feeds', authenticated, restController.getFeeds)

router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

router.get('/restaurants/:id', authenticated, restController.getRestaurant)

router.get('/restaurants', authenticated, restController.getRestaurants)

// 評論
router.post('/comments', authenticated, commentController.postComment)

router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

// 收藏
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)

router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// 喜歡
router.post('/like/:restaurantId', authenticated, userController.addLike)

router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// 個人頁面
router.get('/users/:id', authenticated, userController.getUser)

router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, userController.putUser)

router.use('/', generalErrorHandler)

// fallback路由，當匹配不到時就會執行這一行
// 跟router.get的差別在於get只有限定'/'，use的範圍相對廣泛
router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router
