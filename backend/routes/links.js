const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {validate} = require('../utils/validation');
const {createLink, getAllLinks, getLinkById, updateLink, deleteLink} = require('../controllers/linkController');

router.use(protect);

router.route('/')
    .post(validate('createLink'), createLink)
    .get(getAllLinks);
    
router.route('/:id')    
    .get(getLinkById)
    .put(validate('updateLink'), updateLink)
    .delete(deleteLink);

module.exports = router;