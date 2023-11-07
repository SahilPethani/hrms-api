const catchAsyncErrors = require("../errors/catchAsyncErrors")
const Product = require("../models/productModel")
const { StatusCodes } = require("http-status-codes");
const ApiFeatures = require("../utils/apifeatures")
const ErrorHander = require("../middleware/errorhander");
const userModel = require("../models/userModel");
const Review = require("../models/reviewsModel");
const cloudinary = require("cloudinary");


// create product  

const createProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        // Ensure that 'req.body.image' contains an array of base64 image data
        const images = req.body.image;

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "product-images",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks; // Replace 'image' with 'images'
        // Add other fields like name, description, and so on to 'req.body'

        const product = await Product.create(req.body);

        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal server error",
        });
    }
})


//get all Product
// const getAllSellerProducts = catchAsyncErrors(async (req, res, next) => {
//     const sellerId = req.user.userId;

//     // Pagination
//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     // Search
//     const searchQuery = req.query.search || '';
//     const searchFilter = searchQuery
//         ? { name: { $regex: searchQuery, $options: 'i' }, seller: sellerId }
//         : { seller: sellerId };

//     // Min/Max price filtering
//     const minPrice = parseFloat(req.query.minPrice) || 0;
//     const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
//     searchFilter.price = { $gte: minPrice, $lte: maxPrice };

//     // Category filtering
//     const category = req.query.category || '';
//     if (category) {
//         searchFilter.category = category;
//     }

//     const allProduct = await Product.find(searchFilter)
//         .select('-seller') // Exclude the 'seller' field from the response
//         .skip(skip)
//         .limit(limit)
//         .populate({ path: "category", select: { name: 1 } });

//     const totalProductsCount = await Product.countDocuments(searchFilter);

//     res.status(StatusCodes.OK).json({
//         data: allProduct,
//         status: StatusCodes.OK,
//         success: true,
//         currentPage: page,
//         totalPages: Math.ceil(totalProductsCount / limit),
//         totalProductsCount,
//         countProduct: allProduct.length
//     });
// })

const getAllSellerProducts = catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.user.userId;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.count) || 10;
    const skip = (page - 1) * limit;

    // Search
    const searchQuery = req.query.searchText || '';
    const skuQuery = req.query.sku || '';
    const searchFilter = {
        seller: sellerId,
        $and: [
            {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } }
                ]
            },
            {
                $or: [
                    { sku: { $regex: skuQuery, $options: 'i' } }
                ]
            }
        ]
    };

    // Min/Max price filtering
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    searchFilter.price = { $gte: minPrice, $lte: maxPrice };

    // Category filtering
    const category = req.query.category || '';
    if (category) {
        searchFilter.category = category;
    }

    // Quantity filtering
    const quantitySearch = req.query.quantity || '';
    if (quantitySearch) {
        searchFilter.quantity = parseInt(quantitySearch);
    }

    // Status filtering
    const status = req.query.status;
    if (status === '0' || status === '1') {
        searchFilter.status = parseInt(status);
    }

    const allProduct = await Product.find(searchFilter)
        .select('-seller') // Exclude the 'seller' field from the response
        .skip(skip)
        .limit(limit)
        .populate({ path: "category", select: { name: 1 } });

    const totalProductsCount = await Product.countDocuments(searchFilter);

    res.status(StatusCodes.OK).json({
        data: allProduct,
        status: StatusCodes.OK,
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalProductsCount / limit),
        totalProductsCount,
        countProduct: allProduct.length
    });
})

const getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filters = {};

    // Search functionality
    const { search, minPrice, maxPrice, category } = req.query;

    if (search) {
        filters.name = { $regex: new RegExp(search, "i") };
    }

    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseInt(minPrice);
        if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    // Category filtering
    if (category) {
        filters.category = category;
    }

    const allProduct = await Product.find(filters)
        .skip(skip)
        .limit(limit)
        .populate({ path: "category", select: { name: 1 } });

    const totalProductsCount = await Product.countDocuments(filters);

    res.status(StatusCodes.OK).json({
        data: allProduct,
        status: StatusCodes.OK,
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalProductsCount / limit),
        totalProductsCount,
    });
})

//get singel product 
const getProductDetails = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id).populate({ path: "category", select: { name: 1 } })
    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: product,
    })
})

// find product by category

const getProductCategoryDetails = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.find({ category: req.params.id }).populate({ path: "category", select: { name: 1 } })
    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: product,
    })
})

// updateProduct --- Admin

const updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Product Updated successfully"
    })
})

// delete one Product

const deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }
    await product.remove();
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Product deleted successfully"
    })
})

// create a new review or update the review
const creatProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user.userId,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
        (rev) => rev.user?.toString() === req.user.userId.toString()
    );
    isReviewed ? product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user.userId.toString())
            (rev.rating = rating), (rev.comment = comment);
    }) : product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;
    await product.save({ validateBeforeSave: false });

    const newReviews = await Review.findOne({ user: req.user.userId, product: productId });
    if (newReviews) {
        newReviews.comment = comment
        newReviews.rating = rating
        await newReviews.save({ validateBeforeSave: false });
    } else {
        const reviewss = new Review({
            user: req.user.userId,
            product: productId,
            comment: comment,
            rating: rating
        })
        await reviewss.save();
    }
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Review Added successfully",
    });
})

const getReviewUser = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user.userId, }).skip(skip).limit(limit).populate('product');

    if (!reviews) {
        return next(new ErrorHander("Reviews not found", 404))
    }

    const totalReviewsCount = reviews?.length;

    res.status(StatusCodes.OK).json({
        data: reviews,
        status: StatusCodes.OK,
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalReviewsCount / limit),
        totalReviewsCount,
    });
})

// get all Review
const getAllReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) {
        return next(new ErrorHander("Product not found", 404))
    }
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        ratings: product.ratings,
        reviews: product.reviews,
    })
})

// delete Review
const deleteReview = catchAsyncErrors(async (req, res, next) => {
    const userId = req.query.userId
    const productId = req.query.productId
    const product = await Product.findById(productId)
    if (!product) {
        return next(new ErrorHander("Product not found", 404))
    }
    const reviews = product.reviews.filter((rev) => rev._id?.toString() !== req.query.reviewId.toString())
    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });
    let ratings = 0;
    reviews.length === 0 ? ratings = 0 : ratings = avg / reviews.length
    const numOfReviews = reviews.length
    await Product.findByIdAndUpdate(
        productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );
    await Review.findOneAndRemove({ user: userId, product: productId });

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Review deleted successfully"
    })
})

module.exports = {
    createProduct,
    getAllProducts,
    getAllSellerProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    creatProductReview,
    getAllReview,
    deleteReview,
    getProductCategoryDetails,
    getReviewUser
}