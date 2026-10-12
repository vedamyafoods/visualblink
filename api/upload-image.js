import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { file, folder = 'products' } = req.body || {};
        if (!file) {
            return res.status(400).json({ error: 'No file data provided' });
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'luq2xhci';
        const apiKey = process.env.CLOUDINARY_API_KEY || '289243668461982';
        const apiSecret = process.env.CLOUDINARY_API_SECRET || 'CFwH8Mtwyl3MEOrqWSh8E8Ihj1U';

        const folderName = `visualblink/${folder}`;
        const timestamp = Math.round(new Date().getTime() / 1000);

        const paramsToSign = `folder=${folderName}&timestamp=${timestamp}`;
        const signature = crypto.createHash('sha1').update(`${paramsToSign}${apiSecret}`).digest('hex');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', folderName);
        formData.append('signature', signature);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await uploadRes.json();
        if (!uploadRes.ok) {
            return res.status(uploadRes.status || 400).json({
                error: data.error?.message || 'Cloudinary upload failed'
            });
        }

        return res.status(200).json({
            success: true,
            url: data.secure_url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height
        });
    } catch (error) {
        console.error('Upload API handler error:', error);
        return res.status(500).json({ error: error.message || 'Server upload failure' });
    }
}
