// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// // Helper function to get absolute font path
// const fontPath = (font) => path.join(__dirname, '..', 'fonts', font);

// function generateCertificate(userName, courseName, instructorName, certificateId, logoImageBuffer) {
//     return new Promise((resolve, reject) => {
//         // --- Static Configuration ---
//         const verificationUrl = 'https://nucleus-edte.vercel.app/verify';
//         const directorName = 'Soumen Pal';
//         const outputPath = `certificate-${certificateId}.pdf`;

//         const doc = new PDFDocument({
//             size: [1000, 700],
//             margin: 0,
//         });

//         const stream = fs.createWriteStream(outputPath);
//         doc.pipe(stream);

//         stream.on('finish', () => {
//             console.log(`Certificate generated successfully: ${outputPath}`);
//             resolve(outputPath);
//         });
//         stream.on('error', reject);
//         doc.on('error', reject);

//         // --- Register Fonts using absolute paths ---
//         try {
//             doc.registerFont('Montserrat-Light', fontPath('Montserrat-Light.ttf'));
//             doc.registerFont('Montserrat-Regular', fontPath('Montserrat-Regular.ttf'));
//             doc.registerFont('Montserrat-SemiBold', fontPath('Montserrat-SemiBold.ttf'));
//             doc.registerFont('Montserrat-Bold', fontPath('Montserrat-Bold.ttf'));
//             doc.registerFont('Lora-Regular', fontPath('Lora-Regular.ttf'));
//             doc.registerFont('Lora-Italic', fontPath('Lora-Italic.ttf'));
//             doc.registerFont('DancingScript-Regular', fontPath('DancingScript-Regular.ttf'));
//         } catch (error) {
//             return reject(new Error("Font file not found. Ensure .ttf files are in the /fonts directory. " + error.message));
//         }

//         // --- Constants ---
//         const page = { width: 1000, height: 700 };
//         const margins = { top: 40, right: 60, bottom: 40, left: 60 };
//         const colors = { background: '#F9F9F7', charcoal: '#333333', gold: '#a98b4f', gray: '#555555' };
//         const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

//         // --- Drawing Logic ---

//         // Background
//         doc.rect(0, 0, page.width, page.height).fill(colors.background);

//         // Header
//         // **MODIFIED: Use the provided image buffer**
//         if (logoImageBuffer) {
//             try {
//                 doc.image(logoImageBuffer, margins.left, margins.top, { width: 150 });
//             } catch (error) {
//                 console.warn("Invalid logo image buffer provided. Using text fallback.", error.message);
//                 doc.font('Montserrat-Bold').fontSize(24).fillColor(colors.charcoal)
//                     .text('Nucleus', margins.left, margins.top);
//             }
//         } else {
//             // Fallback to text if no buffer is provided
//             doc.font('Montserrat-Bold').fontSize(24).fillColor(colors.charcoal)
//                 .text('Nucleus', margins.left, margins.top);
//         }

//         const title = 'Certificate of Completion';
//         const titleWidth = doc.font('Montserrat-SemiBold').fontSize(22).widthOfString(title.toUpperCase());
//         doc.text(title.toUpperCase(), page.width - margins.right - titleWidth, margins.top);

//         doc.save()
//             .moveTo(page.width - margins.right - 150, margins.top + 35)
//             .lineTo(page.width - margins.right, margins.top + 35)
//             .stroke(colors.gold, { lineWidth: 2 });
//         doc.restore();

//         // Body
//         const bodyY = 250;
//         const contentWidth = page.width - margins.left - margins.right;

//         doc.font('Lora-Italic').fontSize(18).fillColor(colors.charcoal)
//             .text('This certifies that', margins.left, bodyY, { align: 'center', width: contentWidth });
//         doc.moveDown(1.5);
//         doc.font('Montserrat-Light').fontSize(52).fillColor(colors.gold)
//             .text(userName, { align: 'center', width: contentWidth });
//         doc.moveDown(1.5);
//         doc.font('Lora-Italic').fontSize(18).fillColor(colors.charcoal)
//             .text('has successfully completed the course', { align: 'center', width: contentWidth });
//         doc.moveDown(1);
//         doc.font('Montserrat-SemiBold').fontSize(28)
//             .text(courseName, { align: 'center', width: contentWidth });

//         // ... (The rest of the footer code remains the same) ...
//         const footerY = page.height - margins.bottom - 100;
//         const sealSize = 80;
//         doc.save();
//         doc.translate(margins.left, footerY);
//         doc.circle(sealSize / 2, sealSize / 2, sealSize / 2 - 1).lineWidth(2).stroke(colors.gold);
//         doc.circle(sealSize / 2, sealSize / 2, sealSize / 2 - 7).lineWidth(1).stroke(colors.gold);
//         doc.font('Montserrat-Bold').fontSize(24).fillColor(colors.gold)
//             .text('N', 0, 28, { width: sealSize, align: 'center' });
//         doc.font('Montserrat-Regular').fontSize(10)
//             .text('EST. 2025', 0, 52, { width: sealSize, align: 'center' });
//         doc.restore();
//         doc.font('Lora-Regular').fontSize(12).fillColor(colors.charcoal);
//         doc.text(`Issued on: ${completionDate}`, margins.left + sealSize + 20, footerY + 25);
//         doc.text(`Certificate ID: ${certificateId}`, margins.left + sealSize + 20, footerY + 45);
//         const qrSize = 80;
//         const qrX = (page.width / 2) - (qrSize / 2);
//         try {
//             fs.accessSync('qr-code.png');
//             doc.image('qr-code.png', qrX, footerY, { width: qrSize });
//             doc.font('Lora-Regular').fontSize(11).fillColor(colors.gray)
//                 .text(`Verify at ${verificationUrl}`, qrX - 30, footerY + qrSize + 5, { width: qrSize + 60, align: 'center' });
//         } catch (error) {
//             console.warn("qr-code.png not found. Skipping QR code.");
//             doc.font('Lora-Regular').fontSize(11).fillColor(colors.gray)
//                 .text("QR Code Here", qrX, footerY + (qrSize / 2), { width: qrSize, align: 'center' });
//         }
//         const signatureBlockWidth = 200;
//         const instructorX = page.width - margins.right - signatureBlockWidth * 2 - 50;
//         const directorX = page.width - margins.right - signatureBlockWidth;
//         doc.moveTo(instructorX, footerY + 40).lineTo(instructorX + signatureBlockWidth, footerY + 40).stroke(colors.charcoal);
//         doc.font('DancingScript-Regular').fontSize(22).fillColor(colors.charcoal)
//             .text(instructorName, instructorX, footerY + 50, { width: signatureBlockWidth, align: 'center' });
//         doc.font('Lora-Italic').fontSize(14)
//             .text('Course Instructor', instructorX, footerY + 75, { width: signatureBlockWidth, align: 'center' });
//         doc.moveTo(directorX, footerY + 40).lineTo(directorX + signatureBlockWidth, footerY + 40).stroke(colors.charcoal);
//         doc.font('DancingScript-Regular').fontSize(22).fillColor(colors.charcoal)
//             .text(directorName, directorX, footerY + 50, { width: signatureBlockWidth, align: 'center' });
//         doc.font('Lora-Italic').fontSize(14)
//             .text('Director of Education', directorX, footerY + 75, { width: signatureBlockWidth, align: 'center' });

//         // Finalize the PDF
//         doc.end();
//     });
// }

// module.exports = generateCertificate;

const PDFDocument = require('pdfkit');
const path = require('path');

const fontPath = (font) => path.join(__dirname, '..', 'fonts', font);

exports.generateCertificate = function (userName, courseName, instructorName, finalCertificateId, logoImageBuffer) {
    return new Promise((resolve, reject) => {
        // --- Static Configuration ---
        const verificationUrl = 'https://nucleus-edte.vercel.app/verify';
        const directorName = 'Soumen Pal';

        const doc = new PDFDocument({
            size: [1000, 700],
            margin: 0,
        });

        // --- Collect PDF data into a buffer ---
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            console.log('Certificate generated successfully in memory.');
            resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // --- Register Fonts ---
        try {
            doc.registerFont('Montserrat-Light', fontPath('Montserrat-Light.ttf'));
            doc.registerFont('Montserrat-Regular', fontPath('Montserrat-Regular.ttf'));
            doc.registerFont('Montserrat-SemiBold', fontPath('Montserrat-SemiBold.ttf'));
            doc.registerFont('Montserrat-Bold', fontPath('Montserrat-Bold.ttf'));
            doc.registerFont('Lora-Regular', fontPath('Lora-Regular.ttf'));
            doc.registerFont('Lora-Italic', fontPath('Lora-Italic.ttf'));
            doc.registerFont('DancingScript-Regular', fontPath('DancingScript-Regular.ttf'));
        } catch (error) {
            return reject(new Error("Font file not found. Ensure .ttf files are in the /fonts directory. " + error.message));
        }

        // --- Constants ---
        const page = { width: 1000, height: 700 };
        const margins = { top: 40, right: 60, bottom: 40, left: 60 };
        const colors = { background: '#F9F9F7', charcoal: '#333333', gold: '#a98b4f', gray: '#555555' };
        const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // --- Drawing Logic ---

        // Background
        doc.rect(0, 0, page.width, page.height).fill(colors.background);

        // Header
        if (logoImageBuffer) {
            try {
                doc.image(logoImageBuffer, margins.left, margins.top, { width: 150 });
            } catch (error) {
                console.warn("Invalid logo image buffer. Using text fallback.", error.message);
                doc.font('Montserrat-Bold').fontSize(24).fillColor(colors.charcoal)
                    .text('Nucleus', margins.left, margins.top);
            }
        } else {
            doc.font('Montserrat-Bold').fontSize(24).fillColor(colors.charcoal)
                .text('Nucleus', margins.left, margins.top);
        }

        const title = 'Certificate of Completion';
        const titleWidth = doc.font('Montserrat-SemiBold').fontSize(22).widthOfString(title.toUpperCase());
        doc.text(title.toUpperCase(), page.width - margins.right - titleWidth, margins.top);

        doc.save()
            .moveTo(page.width - margins.right - 150, margins.top + 35)
            .lineTo(page.width - margins.right, margins.top + 35)
            .stroke(colors.gold, { lineWidth: 2 });
        doc.restore();

        // **MOVED: Certificate Details to Top Right**
        const detailsY = margins.top + 45;
        const detailsWidth = 250;
        const detailsX = page.width - margins.right - detailsWidth;

        doc.font('Lora-Regular').fontSize(10).fillColor(colors.charcoal);
        doc.text(`Issued on: ${completionDate}`, detailsX, detailsY, {
            width: detailsWidth,
            align: 'right'
        });
        doc.moveDown(0.5);
        doc.text(`Certificate ID: ${finalCertificateId}`, {
            width: detailsWidth,
            align: 'right'
        });


        // Body
        const bodyY = 250;
        const contentWidth = page.width - margins.left - margins.right;

        doc.font('Lora-Italic').fontSize(18).fillColor(colors.charcoal)
            .text('This certifies that', margins.left, bodyY, { align: 'center', width: contentWidth });
        doc.moveDown(1.5);
        doc.font('Montserrat-Light').fontSize(52).fillColor(colors.gold)
            .text(userName, { align: 'center', width: contentWidth });
        doc.moveDown(1.5);
        doc.font('Lora-Italic').fontSize(18).fillColor(colors.charcoal)
            .text('has successfully completed the course', { align: 'center', width: contentWidth });
        doc.moveDown(1);
        doc.font('Montserrat-SemiBold').fontSize(28)
            .text(courseName, { align: 'center', width: contentWidth });

        // Footer
        const footerY = page.height - margins.bottom - 100;
        const sealSize = 80;
        doc.save();
        doc.translate(margins.left, footerY);
        doc.circle(sealSize / 2, sealSize / 2, sealSize / 2 - 1).lineWidth(2).stroke(colors.gold);
        doc.circle(sealSize / 2, sealSize / 2, sealSize / 2 - 7).lineWidth(1).stroke(colors.gold);
        doc.font('Montserrat-Bold').fontSize(24).fillColor(colors.gold)
            .text('N', 0, 28, { width: sealSize, align: 'center' });
        doc.font('Montserrat-Regular').fontSize(10)
            .text('EST. 2025', 0, 52, { width: sealSize, align: 'center' });
        doc.restore();

        // **REMOVED: Certificate Details from here**

        // QR Code
        // (Assuming you have a qr-code.png file in your server root)
        const qrSize = 80;
        const qrX = (page.width / 2) - (qrSize / 2);
        try {
            const qrPath = path.join(__dirname, '..', 'qr-code.png');
            doc.image(qrPath, qrX, footerY, { width: qrSize });
            doc.font('Lora-Regular').fontSize(11).fillColor(colors.gray)
                .text(`Verify at ${verificationUrl}`, qrX - 30, footerY + qrSize + 5, { width: qrSize + 60, align: 'center' });
        } catch (error) {
            console.warn("qr-code.png not found. Skipping QR code.");
        }

        // Signatures
        const signatureBlockWidth = 200;
        const instructorX = page.width - margins.right - signatureBlockWidth * 2 - 50;
        const directorX = page.width - margins.right - signatureBlockWidth;
        doc.moveTo(instructorX, footerY + 40).lineTo(instructorX + signatureBlockWidth, footerY + 40).stroke(colors.charcoal);
        doc.font('DancingScript-Regular').fontSize(22).fillColor(colors.charcoal)
            .text(instructorName, instructorX, footerY + 50, { width: signatureBlockWidth, align: 'center' });
        doc.font('Lora-Italic').fontSize(14)
            .text('Course Instructor', instructorX, footerY + 75, { width: signatureBlockWidth, align: 'center' });
        doc.moveTo(directorX, footerY + 40).lineTo(directorX + signatureBlockWidth, footerY + 40).stroke(colors.charcoal);
        doc.font('DancingScript-Regular').fontSize(22).fillColor(colors.charcoal)
            .text(directorName, directorX, footerY + 50, { width: signatureBlockWidth, align: 'center' });
        doc.font('Lora-Italic').fontSize(14)
            .text('Director of Education', directorX, footerY + 75, { width: signatureBlockWidth, align: 'center' });

        // Finalize the PDF
        doc.end();
    });
}

