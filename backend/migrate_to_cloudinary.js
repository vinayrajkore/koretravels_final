require('dotenv').config();
const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = path.join(__dirname, 'uploads');

async function uploadToCloudinary(localFilename) {
    if (!localFilename || localFilename.startsWith('http')) return localFilename;
    const localPath = path.join(uploadsDir, localFilename);
    if (!fs.existsSync(localPath)) {
        console.warn(`File not found locally: ${localPath}`);
        return localFilename; // fallback to keeping it as is
    }
    try {
        console.log(`Uploading ${localFilename}...`);
        const result = await cloudinary.uploader.upload(localPath, {
            folder: 'busbooking'
        });
        return result.secure_url;
    } catch (e) {
        console.error(`Failed to upload ${localFilename}:`, e.message);
        return localFilename;
    }
}

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'busbooking'
    });

    console.log("Migrating buses...");
    const [buses] = await db.query("SELECT * FROM buses");
    for (let bus of buses) {
        let changed = false;
        let newFirstImage = bus.bus_image;
        if (newFirstImage && !newFirstImage.startsWith('http')) {
            newFirstImage = await uploadToCloudinary(newFirstImage);
            changed = true;
        }

        let newPhotos = [];
        try {
            const photosArr = JSON.parse(bus.photos || "[]");
            for (let photo of photosArr) {
                if (photo && !photo.startsWith('http')) {
                    const newUrl = await uploadToCloudinary(photo);
                    newPhotos.push(newUrl);
                    changed = true;
                } else {
                    newPhotos.push(photo);
                }
            }
        } catch(e) {}

        if (changed) {
            await db.query(
                "UPDATE buses SET bus_image=?, photos=? WHERE id=?",
                [newFirstImage, JSON.stringify(newPhotos), bus.id]
            );
            console.log(`Updated bus ${bus.id}`);
        }
    }

    console.log("Migrating banners...");
    const [banners] = await db.query("SELECT * FROM banners");
    for (let banner of banners) {
        if (banner.image_filename && !banner.image_filename.startsWith('http')) {
            const newUrl = await uploadToCloudinary(banner.image_filename);
            await db.query(
                "UPDATE banners SET image_filename=? WHERE id=?",
                [newUrl, banner.id]
            );
            console.log(`Updated banner ${banner.id}`);
        }
    }

    console.log("Migration completed!");
    db.end();
}

run().catch(console.error);
