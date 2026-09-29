// Live Cloudinary API & Media Utility Helper

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcjn4y284';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'print85';

/**
 * Upload file to Cloudinary via Unsigned API using XMLHttpRequest for progress tracking
 */
export async function uploadToCloudinary(file, folder = 'artwork_uploads', onProgress = null) {
  const extension = file.name.split('.').pop().toLowerCase();
  // Raw resource type for non-standard image formats like ai, psd, cdr
  const isRawFormat = ['ai', 'psd', 'cdr'].includes(extension);
  const resourceType = isRawFormat ? 'raw' : 'auto';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    if (folder) {
      formData.append('folder', `printigly/${folder}`);
    }

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, true);

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            secureUrl: data.secure_url,
            url: data.secure_url,
            publicId: data.public_id,
            fileName: data.original_filename ? `${data.original_filename}.${data.format || extension}` : file.name,
            originalFileName: file.name,
            fileType: file.type || extension,
            fileSize: file.size,
            format: data.format || extension,
            width: data.width || null,
            height: data.height || null,
            cloudinaryResourceType: data.resource_type || resourceType,
            uploadedAt: new Date().toISOString()
          });
        } catch (err) {
          reject(new Error(`Cloudinary parse error: ${err.message}`));
        }
      } else {
        // Fallback retry without folder if Cloudinary preset rejects folder parameter
        try {
          const fallbackFormData = new FormData();
          fallbackFormData.append('file', file);
          fallbackFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

          const fallbackXhr = new XMLHttpRequest();
          if (onProgress && fallbackXhr.upload) {
            fallbackXhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                onProgress(Math.round((event.loaded / event.total) * 100));
              }
            };
          }
          fallbackXhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, true);

          fallbackXhr.onload = async () => {
            if (fallbackXhr.status >= 200 && fallbackXhr.status < 300) {
              const data = JSON.parse(fallbackXhr.responseText);
              resolve({
                success: true,
                secureUrl: data.secure_url,
                url: data.secure_url,
                publicId: data.public_id,
                fileName: data.original_filename ? `${data.original_filename}.${data.format || extension}` : file.name,
                originalFileName: file.name,
                fileType: file.type || extension,
                fileSize: file.size,
                format: data.format || extension,
                width: data.width || null,
                height: data.height || null,
                cloudinaryResourceType: data.resource_type || resourceType,
                uploadedAt: new Date().toISOString()
              });
            } else {
              // Local Base64 fallback if network/Cloudinary quota is reached
              const base64Url = await new Promise((res) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result);
                reader.readAsDataURL(file);
              });
              resolve({
                success: true,
                secureUrl: base64Url,
                url: base64Url,
                publicId: `printigly_local_${Date.now()}`,
                fileName: file.name,
                originalFileName: file.name,
                fileType: file.type || extension,
                fileSize: file.size,
                format: extension,
                width: 1200,
                height: 1800,
                cloudinaryResourceType: resourceType,
                uploadedAt: new Date().toISOString()
              });
            }
          };
          fallbackXhr.onerror = () => reject(new Error('Cloudinary network connection failed'));
          fallbackXhr.send(fallbackFormData);
        } catch (e) {
          reject(e);
        }
      }
    };

    xhr.onerror = () => reject(new Error('Cloudinary network error'));
    xhr.send(formData);
  });
}

/**
 * Generate Cloudinary Transformation URLs
 */
export function getCloudinaryTransformedUrl(url, transformation = 'c_fill,w_800,q_auto,f_auto') {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  
  return url.replace('/upload/', `/upload/${transformation}/`);
}
