import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'luq2xhci';
    const apiKey = process.env.CLOUDINARY_API_KEY || '289243668461982';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'CFwH8Mtwyl3MEOrqWSh8E8Ihj1U';

    const folderName = req.body?.folder ? `visualblink/${req.body.folder}` : 'visualblink/products';
    const timestamp = Math.round(new Date().getTime() / 1000);

    // In Cloudinary, parameters must be sorted alphabetically before signing
    const paramsToSign = `folder=${folderName}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(`${paramsToSign}${apiSecret}`).digest('hex');

    return res.status(200).json({
        success: true,
        cloudName,
        apiKey,
        timestamp,
        folder: folderName,
        signature
    });
}
