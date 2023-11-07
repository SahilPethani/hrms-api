const uploadImagesToCloudinary = async (imagePaths) => {
    const imagesLinks = [];

    for (let i = 0; i < imagePaths.length; i++) {
        const result = await cloudinary.uploader.upload(imagePaths[i], {
            folder: "product-images",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    return imagesLinks;
};
