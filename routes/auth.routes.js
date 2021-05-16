const router = require('express').Router()
const authControllers = require('../controllers/auth.controllers')


router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/logout').get(authControllers.logout)
router.route('/refresh-token').get(authControllers.refreshToken)
router.route('/checkloginstatus').get(authControllers.authenticated)
router.route('/googlelogin').post(authControllers.google_login)


module.exports = router