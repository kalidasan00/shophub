const express = require('express')
const router = express.Router()
const { getShops, getShop, createShop, updateShop, deleteShop, followShop } = require('../controllers/shopController')
const { protect, isShopOwner } = require('../middleware/auth')

router.get('/',    getShops)
router.get('/:id', getShop)
router.post('/',          protect,             createShop)   // any logged-in user can create a shop
router.put('/:id',        protect, isShopOwner, updateShop)  // only shop owner can edit
router.delete('/:id',     protect, isShopOwner, deleteShop)  // only shop owner can delete
router.post('/:id/follow', protect,             followShop)

module.exports = router