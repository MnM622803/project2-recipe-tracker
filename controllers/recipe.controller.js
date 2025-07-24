const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')
const isSignedIn = require('../middleware/is-signed-in')
const upload = require('../config/multer') 



router.get('/new', isSignedIn, (req, res) => {
    res.render('recipes/new.ejs')
})


router.post('/', isSignedIn, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.send('❌ No file uploaded. Check your form field name and enctype.')
        }
        const recipeData = {
            title: req.body.title,
            description: req.body.description,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
            image: { 
                url: req.file.path, 
                cloudinary_id: req.file.filename  // Cloudinary public_id
            },
            author: req.session.user._id,
        }
        console.log(recipeData)
        await Recipe.create(recipeData)
        res.redirect('/recipes')
    } catch (err) {
        console.error('🔥 Recipe cretion error:', err)
        res.send('❌ Something went wrong while creating the recipe.')
    }
})

router.get('/', async (req, res) => {
    try {
        const allRecipes = await Recipe.find().populate('author')
        res.render('recipes/index.ejs', { allRecipes })
    } catch (err) {
        console.error(err)
        res.send('❌ Something wen wrng while loading recipes.')
    }
})


router.get('/show', isSignedIn, async (req, res) => {
    try {
        const userRecipes = await Recipe.find({ author: req.session.user._id })
        res.render('recipes/show.ejs', { userRecipes })
    } catch (err) {
        console.error(err)
        res.send('❌ Could not lod you recipes.')
    }
})


router.get('/:recipeId', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId)
            .populate('author')
            .populate('comments.author')
        res.render('recipes/show-one.ejs', { recipe }) 
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})


router.delete('/:recipeId', isSignedIn, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId).populate('author')
        if (recipe.author._id.equals(req.session.user._id)) {
            await recipe.deleteOne()
            return res.redirect('/recipes')
        }
        res.send('❌ Not authorized to delet recipe.')
    } catch (err) {
        console.error(err)
        res.send('❌ Something went wrong while deleting the recipe.')
    }
})


router.get('/:recipeId/edit', isSignedIn, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId).populate('author')
        if (recipe.author._id.equals(req.session.user._id)) {
            return res.render('recipes/edit.ejs', { recipe })
        }
        res.send('❌ Not authorized to edit this recipe.')
    } catch (err) {
        console.error(err)
        res.redirect('/recipes')
    }
})


router.put('/:recipeId', isSignedIn, upload.single('image'), async (req, res) => {

    try {
        const recipe = await Recipe.findById(req.params.recipeId).populate('author')
        if (recipe.author._id.equals(req.session.user._id)) {
            await Recipe.findByIdAndUpdate(req.params.recipeId, req.body, { new: true })
            return res.redirect(`/recipes/${req.params.recipeId}`)
        }
        res.send('❌ Not authorized to update this recipe.')
        if (req.file) {
            if (foundListing.image?.cloudinary_id) {
                try {
                    await cloudinary.uploader.destroy(foundListing.image.cloudinary_id)
                } catch (cloudinaryError) {
                }
            }
            foundListing.image = {
                url: req.file.path,
                cloudinary_id: req.file.filename
            }
        }
    } catch (err) {
        console.error(err)
        res.redirect('/recipes')
    }
})


router.post('/:recipeId/comments', isSignedIn, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId)
        req.body.author = req.session.user._id
        recipe.comments.push(req.body)
        await recipe.save()
        res.redirect(`/recipes/${req.params.recipeId}`)
    } catch (err) {
        console.error(err)
        res.send('❌ Something went wrong while adding the comment.')
    }
})

module.exports = router
