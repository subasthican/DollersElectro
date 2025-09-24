const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'dollers-electro',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: options.transformation || [],
      ...options
    };

    let result;

    if (file.buffer) {
      // Handle buffer upload
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) throw error;
      });

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(stream);

      result = await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    } else if (file.path) {
      // Handle file path upload
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
    } else if (typeof file === 'string') {
      // Handle URL upload
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      throw new Error('Invalid file format');
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      assetId: result.asset_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteFromCloudinary(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Multiple image delete error:', error);
    throw new Error('Failed to delete multiple images');
  }
};

// Transform image URL
const transformImageUrl = (publicId, transformation = {}) => {
  try {
    const defaultTransformation = {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformation
    };

    return cloudinary.url(publicId, defaultTransformation);
  } catch (error) {
    console.error('Image transformation error:', error);
    throw new Error('Failed to transform image URL');
  }
};

// Generate responsive image URLs
const generateResponsiveImages = (publicId, options = {}) => {
  try {
    const { widths = [320, 640, 960, 1280], quality = 'auto' } = options;
    
    const responsiveUrls = widths.map(width => ({
      width,
      url: cloudinary.url(publicId, {
        width,
        quality,
        crop: 'scale'
      })
    }));

    return responsiveUrls;
  } catch (error) {
    console.error('Responsive image generation error:', error);
    throw new Error('Failed to generate responsive images');
  }
};

// Generate thumbnail
const generateThumbnail = (publicId, options = {}) => {
  try {
    const { width = 300, height = 300, crop = 'fill' } = options;
    
    return cloudinary.url(publicId, {
      width,
      height,
      crop,
      quality: 'auto'
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Generate product gallery images
const generateProductGallery = (publicId, options = {}) => {
  try {
    const {
      thumbnail = { width: 150, height: 150 },
      small = { width: 300, height: 300 },
      medium = { width: 600, height: 600 },
      large = { width: 1200, height: 1200 }
    } = options;

    return {
      thumbnail: generateThumbnail(publicId, thumbnail),
      small: generateThumbnail(publicId, small),
      medium: generateThumbnail(publicId, medium),
      large: generateThumbnail(publicId, large),
      original: cloudinary.url(publicId)
    };
  } catch (error) {
    console.error('Product gallery generation error:', error);
    throw new Error('Failed to generate product gallery');
  }
};

// Optimize image for web
const optimizeForWeb = (publicId, options = {}) => {
  try {
    const {
      quality = 'auto',
      format = 'auto',
      width,
      height,
      crop = 'scale'
    } = options;

    const transformation = {
      quality,
      fetch_format: format
    };

    if (width) transformation.width = width;
    if (height) transformation.height = height;
    if (crop) transformation.crop = crop;

    return cloudinary.url(publicId, transformation);
  } catch (error) {
    console.error('Web optimization error:', error);
    throw new Error('Failed to optimize image for web');
  }
};

// Add watermark to image
const addWatermark = (publicId, watermarkOptions = {}) => {
  try {
    const {
      text = 'DollersElectro',
      position = 'bottom_right',
      fontFamily = 'Arial',
      fontSize = 20,
      color = 'white',
      opacity = 0.7
    } = watermarkOptions;

    return cloudinary.url(publicId, {
      overlay: {
        text,
        font_family: fontFamily,
        font_size: fontSize,
        font_color: color
      },
      gravity: position,
      opacity
    });
  } catch (error) {
    console.error('Watermark addition error:', error);
    throw new Error('Failed to add watermark');
  }
};

// Generate image metadata
const getImageMetadata = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      url: result.secure_url,
      createdAt: result.created_at,
      tags: result.tags || [],
      context: result.context || {}
    };
  } catch (error) {
    console.error('Image metadata retrieval error:', error);
    throw new Error('Failed to get image metadata');
  }
};

// Search images in Cloudinary
const searchImages = async (query, options = {}) => {
  try {
    const searchOptions = {
      expression: query,
      max_results: options.maxResults || 50,
      sort_by: options.sortBy || 'created_at',
      sort_direction: options.sortDirection || 'desc',
      ...options
    };

    const result = await cloudinary.search(searchOptions);
    return result.resources;
  } catch (error) {
    console.error('Image search error:', error);
    throw new Error('Failed to search images');
  }
};

// Create image collage
const createCollage = (publicIds, options = {}) => {
  try {
    const {
      width = 800,
      height = 600,
      columns = 2,
      rows = 2,
      spacing = 10
    } = options;

    const transformation = {
      width,
      height,
      crop: 'fill',
      background: 'white'
    };

    // Add images to transformation
    publicIds.forEach((publicId, index) => {
      transformation[`overlay_${index}`] = publicId;
      transformation[`overlay_${index}_gravity`] = 'north_west';
      transformation[`overlay_${index}_x`] = (index % columns) * (width / columns + spacing);
      transformation[`overlay_${index}_y`] = Math.floor(index / columns) * (height / rows + spacing);
    });

    // Use the first image as base and apply transformations
    return cloudinary.url(publicIds[0], transformation);
  } catch (error) {
    console.error('Collage creation error:', error);
    throw new Error('Failed to create image collage');
  }
};

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
    return false;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleImages,
  deleteFromCloudinary,
  deleteMultipleImages,
  transformImageUrl,
  generateResponsiveImages,
  generateThumbnail,
  generateProductGallery,
  optimizeForWeb,
  addWatermark,
  getImageMetadata,
  searchImages,
  createCollage,
  testCloudinaryConnection
};








