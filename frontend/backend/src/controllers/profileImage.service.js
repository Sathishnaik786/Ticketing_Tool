const { supabase, supabaseAdmin } = require('@lib/supabase');

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

class ProfileImageService {
  /**
   * Upload profile image to Supabase Storage
   * @param {File} file - The image file to upload
   * @param {string} userId - The user ID for the folder path
   * @returns {Promise<string>} - Public URL of the uploaded image
   */
  async uploadProfileImage(file, userId) {
    try {
      // Validate file type
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      }

      // Validate file size (max 2MB)
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 2MB limit.');
      }

      // Generate filename with proper extension
      const fileExtension = this.getFileExtension(file.mimetype);
      const fileName = `avatar.${fileExtension}`;
      const filePath = `users/${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin
        .storage
        .from('profile-images')
        .upload(filePath, file.buffer, {
          upsert: true, // Overwrite if file exists
          contentType: file.mimetype
        });

      if (error) {
        throw error;
      }

      // Store only the file path in the database, not the full URL
      return filePath;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  /**
   * Update employee profile image in database
   * @param {string} userId - The user ID
   * @param {string} imageUrl - The image URL to store
   * @returns {Promise<Object>} - Updated employee data
   */
  async updateEmployeeProfileImage(userId, imageUrl) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ profile_image: imageUrl })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating employee profile image:', error);
      throw error;
    }
  }

  /**
   * Delete old profile image from storage (helper method)
   * @param {string} userId - The user ID
   * @param {string} oldImageUrl - The old image URL to delete
   */
  async deleteOldProfileImage(userId, oldImageUrl) {
    try {
      if (!oldImageUrl) return;

      // Extract file path from URL
      const urlParts = oldImageUrl.split('/'); // e.g., https://...supabase.co/storage/v1/object/public/profile-images/users/userId/avatar.jpg
      const pathIndex = urlParts.indexOf('profile-images');
      if (pathIndex !== -1) {
        const filePath = urlParts.slice(pathIndex + 1).join('/');

        const { error } = await supabaseAdmin
          .storage
          .from('profile-images')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting old profile image:', error);
          // Don't throw error here as it's not critical for the update to succeed
        }
      }
    } catch (error) {
      console.error('Error in deleteOldProfileImage:', error);
    }
  }

  /**
   * Generate signed URL for profile image
   * @param {string} filePath - The file path in storage
   * @param {number} expiresIn - Number of seconds until the URL expires (default 3600)
   * @returns {Promise<string|null>} - Signed URL of the image, or null if file doesn't exist
   */
  async generateSignedUrl(filePath, expiresIn = 3600) {
    try {
      if (!filePath) return null;

      const { data, error } = await supabaseAdmin
        .storage
        .from('profile-images')
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        // If it's a "not found" error, return null instead of throwing
        if (error.statusCode === '404' || error.status === 404 || error.__isStorageError) {
          // Silently return null - file doesn't exist, which is acceptable
          return null;
        }
        console.error('Error generating signed URL:', error);
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      // Handle storage errors gracefully - don't log "not found" as errors
      if (error.statusCode === '404' || error.status === 404 || error.__isStorageError) {
        // File doesn't exist - this is normal if file was deleted or never uploaded
        return null;
      }
      console.error('Error in generateSignedUrl:', error);
      throw error;
    }
  }

  /**
   * Generate multiple signed URLs for profile images
   * @param {string[]} filePaths - Array of file paths in storage
   * @param {number} expiresIn - Number of seconds until the URLs expire (default 3600)
   * @returns {Promise<Object[]>} - Array of objects containing path and signedUrl
   */
  async generateSignedUrls(filePaths, expiresIn = 3600) {
    try {
      if (!filePaths || filePaths.length === 0) return [];

      const { data, error } = await supabaseAdmin
        .storage
        .from('profile-images')
        .createSignedUrls(filePaths, expiresIn);

      if (error) {
        console.error('Error generating multiple signed URLs:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in generateSignedUrls:', error);
      throw error;
    }
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - The MIME type of the file
   * @returns {string} - File extension
   */
  getFileExtension(mimeType) {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/jpg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/gif':
        return 'gif';
      default:
        return 'jpg'; // default to jpg
    }
  }
}

module.exports = new ProfileImageService();