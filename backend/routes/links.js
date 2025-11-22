const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {createLink, getAllLinks, getLinkById, updateLink, deleteLink} = require('../controllers/linkController');
const { route } = require('./auth');

router.use(protect);

router.route('/')
    .post(createLink)
    .get(getAllLinks);

router.route('/:id')    
    .get(getLinkById)
    .put(updateLink)
    .delete(deleteLink);

module.exports = router;