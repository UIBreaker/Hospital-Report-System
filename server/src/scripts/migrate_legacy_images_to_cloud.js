const pool = require('../config/db');

const CLOUDINARY_CLOUD_NAME = 'rcokvkdu';
const CLOUDINARY_UPLOAD_PRESET = 'hospital_reports';

async function uploadBase64ToCloudinary(base64Str) {
  const formData = new URLSearchParams();
  formData.append('file', base64Str);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'hospital_reports/cases');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.secure_url;
}

async function migrateLegacyImages() {
  console.log('🚀 Starting Automatic Legacy Base64 -> Cloudinary Migration...');
  const conn = await pool.getConnection();

  const tables = ['transfer_cases', 'surgery_cases', 'death_cases', 'critical_cases'];
  let totalImagesMigrated = 0;
  let totalBytesSaved = 0;

  try {
    for (const table of tables) {
      console.log(`\n🔍 Checking table \`${table}\` for legacy Base64 images...`);
      const [rows] = await conn.query(`SELECT id, images FROM \`${table}\` WHERE images IS NOT NULL AND images != ''`);

      for (const row of rows) {
        let raw = row.images;
        if (!raw) continue;

        let imgList = [];
        try {
          imgList = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch (e) {
          imgList = [raw];
        }

        if (!Array.isArray(imgList)) imgList = [imgList];

        let hasBase64 = false;
        const updatedList = [];

        for (let i = 0; i < imgList.length; i++) {
          const item = imgList[i];
          const imgUrl = typeof item === 'string' ? item : item?.url;

          if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('data:image/')) {
            hasBase64 = true;
            const originalBytes = Buffer.byteLength(imgUrl, 'utf8');
            totalBytesSaved += originalBytes;

            console.log(`  📤 [${table} #id: ${row.id}] Uploading image ${i + 1}/${imgList.length} (${Math.round(originalBytes / 1024)} KB) to Cloudinary...`);
            try {
              const cloudUrl = await uploadBase64ToCloudinary(imgUrl);
              console.log(`  ✅ Uploaded successfully -> ${cloudUrl}`);

              if (typeof item === 'object' && item !== null) {
                updatedList.push({
                  ...item,
                  url: cloudUrl,
                  isCloud: true,
                  size: `${Math.round(originalBytes * 0.75 / 1024)} KB`
                });
              } else {
                updatedList.push(cloudUrl);
              }
              totalImagesMigrated++;
            } catch (upErr) {
              console.error(`  ❌ Failed to upload image for ${table} #${row.id}:`, upErr.message);
              updatedList.push(item); // Keep original on error
            }
          } else {
            updatedList.push(item); // Already a URL
          }
        }

        if (hasBase64) {
          const newImagesJson = JSON.stringify(updatedList);
          await conn.query(`UPDATE \`${table}\` SET images = ? WHERE id = ?`, [newImagesJson, row.id]);
          console.log(`  💾 Updated DB row [${table} #id: ${row.id}] with Cloud URLs.`);
        }
      }
    }

    console.log('\n======================================================');
    console.log(`🎉 MIGRATION COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Total Legacy Images Migrated to Cloud: ${totalImagesMigrated}`);
    console.log(`💾 Total Database Size Saved: ${(totalBytesSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrateLegacyImages();
