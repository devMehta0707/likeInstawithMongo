const router = require('express').Router();
const UserController = require('../controllers/UserController');
const PostController = require('../controllers/PostController');
const { authenticate } = require('../middleware/authentication');

// check & body are the same
const { body, check } = require('express-validator');

// REGISTER ROUTE
router.post('/register',
    check('name').exists().withMessage('Name is Required'),
    check('password').exists().withMessage('Password is Required').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+=_{}[\]:;'"<>,.?/~])(?!.*\s).{8,}$/)
        .withMessage('Password must start with a capital letter, be alphanumeric, and include a special character.').isLength({ min: 8 }).withMessage('Min password length is 8'),
    check('email').exists().withMessage('Email-id is Required').isEmail().withMessage('Please enter valid email id'),
    check('username').exists().withMessage('User Name is Required'),
    check('gender').exists().withMessage('Gender is Required').isIn(['male', 'female', 'other']),
    check('mobile').exists().withMessage('Mobile is Required').isMobilePhone().withMessage('Please enter valid mobile number'),
    check('isProfilePublic').exists().withMessage('Profile Type is Required').isIn([true, false]),
    UserController.register
);

// LOGIN ROUTE

router.post('/login',
    check('email').exists().withMessage('Email-id Required').isEmail().withMessage('Please enter valid email id'),
    check('password').exists().withMessage('Passsword Required'),
    UserController.login
)

// CREATE POST ROUTE

router.put('/create-post',
    authenticate,
    check('text').exists().withMessage("Please Enter Post Text"),
    check('isPublic').isBoolean().withMessage('Is Public Field is Required'),
    check('mediaFiles').exists().withMessage('Please Upload Media for post'),
    PostController.createPost
)

router.post('/follow/:user_id',
authenticate,
UserController.followUser
)

router.post('/unfollow/:user_id',
authenticate,
UserController.unfollowUser
)

router.get('/like-post/:post_id',
authenticate,
PostController.likePost
)

router.delete('/delete-post/:post_id',
authenticate,
PostController.deletePost
)

router.get('/block-user/:user_id',
authenticate,
UserController.blockUser
)

router.get('/unblock-user/:user_id',
authenticate,
UserController.unblockUser
)

router.get('/get-user-profile',
authenticate,
UserController.getUserProfile
)

router.get('/explore',
authenticate,
UserController.explore
)

router.patch('/edit-profile',
authenticate,
UserController.editProfile
)

router.patch('/edit-post/:postId',
authenticate,
PostController.editPost
)

module.exports = router;