// // server/utils/GenerateCertificateImage.js
// const { createCanvas, loadImage, registerFont } = require('canvas');
// const path = require('path');

// const fontsPath = path.join(__dirname, '../fonts');

// // Register fonts
// registerFont(path.join(fontsPath, 'Montserrat-Light.ttf'), { family: 'Montserrat', weight: '300' });
// registerFont(path.join(fontsPath, 'Montserrat-SemiBold.ttf'), { family: 'Montserrat', weight: '600' });
// registerFont(path.join(fontsPath, 'Lora-Italic.ttf'), { family: 'Lora', style: 'italic' });
// registerFont(path.join(fontsPath, 'DancingScript-Regular.ttf'), { family: 'DancingScript' });

// async function generateCertificateImage(userName, courseName, instructorName, certificateId) {
//     const width = 1000;
//     const height = 700;
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');

//     // Background
//     ctx.fillStyle = '#F9F9F7';
//     ctx.fillRect(0, 0, width, height);

//     // Gold pattern (optional)
//     ctx.strokeStyle = '#e0e0e0';
//     ctx.lineWidth = 1;
//     for (let i = 0; i < width; i += 20) {
//         ctx.beginPath();
//         ctx.moveTo(i, 0);
//         ctx.lineTo(i, height);
//         ctx.stroke();
//     }

//     // Logo
//     const logo = await loadImage(path.join(__dirname, '../assets/NucleusLogoNew.png'));
//     ctx.drawImage(logo, 60, 40, 150, 50);

//     // Header title
//     ctx.font = '22px Montserrat';
//     ctx.fillStyle = '#333';
//     ctx.textAlign = 'right';
//     ctx.fillText('Certificate of Completion', width - 60, 80);

//     // Gold line under header
//     ctx.strokeStyle = '#a98b4f';
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(width - 210, 90);
//     ctx.lineTo(width - 60, 90);
//     ctx.stroke();

//     // Body
//     ctx.font = '18px Lora';
//     ctx.textAlign = 'center';
//     ctx.fillStyle = '#333';
//     ctx.fillText('This certifies that', width / 2, 250);

//     ctx.font = '52px Montserrat';
//     ctx.fillStyle = '#a98b4f';
//     ctx.fillText(userName, width / 2, 300);

//     ctx.font = '18px Lora';
//     ctx.fillStyle = '#333';
//     ctx.fillText('has successfully completed the course', width / 2, 360);

//     ctx.font = '28px Montserrat';
//     ctx.fillStyle = '#333';
//     ctx.fillText(courseName, width / 2, 400);

//     // Footer
//     ctx.font = '12px Lora';
//     ctx.textAlign = 'left';
//     ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 60, 650);
//     ctx.fillText(`Certificate ID: ${certificateId}`, 60, 670);

//     ctx.font = '22px DancingScript';
//     ctx.textAlign = 'right';
//     ctx.fillText(instructorName, width - 60, 650);
//     ctx.font = '14px Lora';
//     ctx.fillText('Course Instructor', width - 60, 670);

//     return canvas.toBuffer('image/png');
// }

// module.exports = generateCertificateImage;

const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// --- FONT REGISTRATION (Runs once when the module is loaded) ---
try {
    const fontPath = (font) => path.join(__dirname, '..', 'fonts', font);
    registerFont(fontPath('Montserrat-Light.ttf'), { family: 'Montserrat', weight: '300' });
    registerFont(fontPath('Montserrat-Regular.ttf'), { family: 'Montserrat', weight: 'normal' });
    registerFont(fontPath('Montserrat-SemiBold.ttf'), { family: 'Montserrat', weight: '600' });
    registerFont(fontPath('Montserrat-Bold.ttf'), { family: 'Montserrat', weight: 'bold' });
    registerFont(fontPath('Lora-Regular.ttf'), { family: 'Lora' });
    registerFont(fontPath('Lora-Italic.ttf'), { family: 'Lora', style: 'italic' });
    registerFont(fontPath('DancingScript-Regular.ttf'), { family: 'Dancing Script' });
} catch (error) {
    console.error("Fatal Error: Could not register fonts. Ensure .ttf files are in the /fonts directory.", error);
}

/**
 * Generates a course completion certificate as a PNG image buffer.
 *
 * @param {string} userName - The full name of the recipient.
 * @param {string} courseName - The name of the course completed.
 * @param {string} instructorName - The name of the course instructor.
 * @param {string} certificateId - The unique ID for the certificate.
 * @param {Buffer} [logoImageBuffer] - An optional buffer containing the logo image.
 * @param {Buffer} [qrCodeBuffer] - An optional buffer containing the QR code image.
 * @returns {Promise<Buffer>} A promise that resolves with the certificate PNG data as a buffer.
 */
async function generateCertificateImage(userName, courseName, instructorName, certificateId, logoImageBuffer, qrCodeBuffer) {

    // --- Configuration & Constants ---
    const width = 1000;
    const height = 700;
    const margins = { top: 40, right: 60, bottom: 40, left: 60 };
    const colors = { background: '#F9F9F7', charcoal: '#333333', gold: '#a98b4f', gray: '#555555' };
    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const directorName = 'Soumen Pal';

    // --- Canvas Setup ---
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- Drawing Logic ---

    // Background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    // Header
    if (logoImageBuffer) {
        try {
            const logo = await loadImage(logoImageBuffer);
            ctx.drawImage(logo, margins.left, margins.top, 150, 50);
        } catch (e) { console.warn("Could not load logo buffer."); }
    }

    ctx.font = '600 22px Montserrat';
    ctx.fillStyle = colors.charcoal;
    ctx.textAlign = 'right';
    ctx.fillText('Certificate of Completion'.toUpperCase(), width - margins.right, margins.top + 20);

    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width - margins.right - 150, margins.top + 35);
    ctx.lineTo(width - margins.right, margins.top + 35);
    ctx.stroke();

    ctx.font = 'normal 12px Lora';
    ctx.fillStyle = colors.charcoal;
    ctx.fillText(`Issued on: ${completionDate}`, width - margins.right, margins.top + 65);
    ctx.fillText(`Certificate ID: ${certificateId}`, width - margins.right, margins.top + 85);

    // Body
    ctx.textAlign = 'center';
    ctx.font = 'italic 18px Lora';
    ctx.fillStyle = colors.charcoal;
    ctx.fillText('This certifies that', width / 2, 260);

    ctx.font = '300 52px Montserrat';
    ctx.fillStyle = colors.gold;
    ctx.fillText(userName, width / 2, 330);

    ctx.font = 'italic 18px Lora';
    ctx.fillStyle = colors.charcoal;
    ctx.fillText('has successfully completed the course', width / 2, 380);

    ctx.font = '600 28px Montserrat';
    ctx.fillText(courseName, width / 2, 430);

    // Footer
    const footerY = height - margins.bottom - 100;

    // Seal
    const sealX = margins.left + 40;
    const sealY = footerY + 40;
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 39, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 33, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = colors.gold;
    ctx.font = 'bold 24px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', sealX, sealY);
    ctx.font = 'normal 10px Montserrat';
    ctx.fillText('EST. 2025', sealX, sealY + 18);
    ctx.textBaseline = 'alphabetic'; // Reset

    // QR Code
    if (qrCodeBuffer) {
        try {
            const qrCode = await loadImage(qrCodeBuffer);
            const qrSize = 80;
            ctx.drawImage(qrCode, (width / 2) - (qrSize / 2), footerY, qrSize, qrSize);
            ctx.font = 'normal 11px Lora';
            ctx.fillStyle = colors.gray;
            ctx.textAlign = 'center';
            ctx.fillText(`Verify at https://nucleus-edte.vercel.app/verify`, width / 2, footerY + qrSize + 15);
        } catch (e) { console.warn("Could not load QR code buffer."); }
    }

    // Signatures
    const signatureBlockWidth = 200;
    const instructorX = width - margins.right - signatureBlockWidth * 2 - 25;
    const directorX = width - margins.right - signatureBlockWidth + 25;

    // Draw Signature Line Helper
    const drawSignature = (x, name, title) => {
        ctx.strokeStyle = colors.charcoal;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 100, footerY + 40);
        ctx.lineTo(x + 100, footerY + 40);
        ctx.stroke();

        ctx.fillStyle = colors.charcoal;
        ctx.font = 'normal 22px "Dancing Script"';
        ctx.textAlign = 'center';
        ctx.fillText(name, x, footerY + 65);
        ctx.font = 'italic 14px Lora';
        ctx.fillText(title, x, footerY + 85);
    };

    drawSignature(instructorX, instructorName, 'Course Instructor');
    drawSignature(directorX, directorName, 'Director of Education');

    console.log('Image certificate generated successfully in memory.');
    return canvas.toBuffer('image/png');
}

module.exports = generateCertificateImage;