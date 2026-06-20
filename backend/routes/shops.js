const express = require('express')
const router = express.Router()
const { getShops, getShop, createShop, updateShop, deleteShop, followShop } = require('../controllers/shopController')
const { protect, isShopOwner } = require('../middleware/auth')

router.get('/', getShops)
router.get('/:id', getShop)
router.post('/', protect, isShopOwner, createShop)
router.put('/:id', protect, isShopOwner, updateShop)
router.delete('/:id', protect, isShopOwner, deleteShop)
router.post('/:id/follow', protect, followShop)

module.exports = router