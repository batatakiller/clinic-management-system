const PDFDocument = require('pdfkit');

/**
 * Generate a styled Prescription PDF
 *
 * @param {Object} prescription - Prescription document (populated)
 * @param {Object} patient - Patient User document
 * @param {Object} doctor - Doctor User document
 * @returns {Promise<Buffer>} - Resolves with the PDF as a Buffer
 */
const generatePrescriptionPDF = (prescription, patient, doctor) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Prescription - ${patient.name}`,
                    Author: doctor.name,
                    Subject: 'Medical Prescription',
                },
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // ─── HEADER ─────────────────────────────────────────────────────────
            doc
                .fontSize(24)
                .font('Helvetica-Bold')
                .fillColor('#1a73e8')
                .text('HealthCare Management System', { align: 'center' });

            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#555')
                .text('Advanced Medical Care & Diagnosis', { align: 'center' });

            doc.moveDown(0.3);
            doc
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .strokeColor('#1a73e8')
                .lineWidth(2)
                .stroke();

            doc.moveDown(1);

            // ─── DOCTOR INFO ─────────────────────────────────────────────────────
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
            doc.text(`Dr. ${doctor.name}`, { continued: false });
            doc
                .font('Helvetica')
                .fillColor('#555')
                .fontSize(10)
                .text(`Specialization: ${doctor.specialization || 'General Physician'}`);
            if (doctor.licenseNumber) {
                doc.text(`License No: ${doctor.licenseNumber}`);
            }
            doc.text(`Contact: ${doctor.phone || 'N/A'}`);

            // ─── HORIZONTAL DIVIDER ──────────────────────────────────────────────
            doc.moveDown(0.8);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').lineWidth(1).stroke();
            doc.moveDown(0.8);

            // ─── PATIENT INFO ─────────────────────────────────────────────────────
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a73e8').text('Patient Information');
            doc.moveDown(0.4);

            const patientInfoY = doc.y;
            doc.fontSize(10).font('Helvetica').fillColor('#333');
            doc.text(`Name: ${patient.name}`, { continued: false });
            doc.text(`Email: ${patient.email}`);
            doc.text(`Phone: ${patient.phone || 'N/A'}`);

            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor('#333')
                .text(
                    `Date: ${new Date(prescription.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}`,
                    370,
                    patientInfoY
                );

            doc.moveDown(0.8);

            // ─── DIAGNOSIS ───────────────────────────────────────────────────────
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a73e8').text('Diagnosis');
            doc.moveDown(0.3);
            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor('#333')
                .text(prescription.diagnosis);

            doc.moveDown(1);

            // ─── MEDICINES TABLE ──────────────────────────────────────────────────
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a73e8').text('Prescribed Medicines');
            doc.moveDown(0.5);

            // Table header background
            const tableTop = doc.y;
            const colX = { no: 50, name: 75, dosage: 220, frequency: 320, duration: 420 };

            doc.rect(50, tableTop, 495, 20).fill('#1a73e8');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
            doc.text('#', colX.no, tableTop + 6, { width: 20, align: 'center' });
            doc.text('Medicine', colX.name, tableTop + 6, { width: 140 });
            doc.text('Dosage', colX.dosage, tableTop + 6, { width: 95 });
            doc.text('Frequency', colX.frequency, tableTop + 6, { width: 95 });
            doc.text('Duration', colX.duration, tableTop + 6, { width: 75 });

            let rowY = tableTop + 22;
            prescription.medicines.forEach((med, idx) => {
                // Alternating row background
                if (idx % 2 === 0) {
                    doc.rect(50, rowY, 495, 20).fill('#f0f4ff');
                }

                doc.fontSize(9).font('Helvetica').fillColor('#333');
                doc.text(String(idx + 1), colX.no, rowY + 6, { width: 20, align: 'center' });
                doc.text(med.name, colX.name, rowY + 6, { width: 140 });
                doc.text(med.dosage, colX.dosage, rowY + 6, { width: 95 });
                doc.text(med.frequency, colX.frequency, rowY + 6, { width: 95 });
                doc.text(med.duration, colX.duration, rowY + 6, { width: 75 });

                if (med.instructions) {
                    rowY += 20;
                    doc
                        .fontSize(8)
                        .font('Helvetica-Oblique')
                        .fillColor('#666')
                        .text(`   ↳ ${med.instructions}`, colX.name, rowY + 3, { width: 450 });
                }

                rowY += 22;
            });

            doc.y = rowY + 10;

            // ─── GENERAL INSTRUCTIONS ─────────────────────────────────────────────
            if (prescription.generalInstructions) {
                doc.moveDown(0.8);
                doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a73e8').text('General Instructions');
                doc.moveDown(0.3);
                doc
                    .fontSize(10)
                    .font('Helvetica')
                    .fillColor('#333')
                    .text(prescription.generalInstructions);
            }

            // ─── FOLLOW-UP ────────────────────────────────────────────────────────
            if (prescription.followUpDate) {
                doc.moveDown(0.5);
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#e53935').text(
                    `Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}`
                );
            }

            // ─── FOOTER / SIGNATURE ───────────────────────────────────────────────
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').lineWidth(1).stroke();
            doc.moveDown(0.5);

            doc
                .fontSize(8)
                .font('Helvetica')
                .fillColor('#999')
                .text(
                    'This prescription is digitally generated by HealthCare Management System. ' +
                    'This document is valid only when signed by the prescribing doctor.',
                    { align: 'center' }
                );

            doc.moveDown(0.5);
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#333')
                .text(`Dr. ${doctor.name}`, { align: 'right' });
            doc.fontSize(8).font('Helvetica').fillColor('#555').text('Authorized Signature', { align: 'right' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generatePrescriptionPDF };
