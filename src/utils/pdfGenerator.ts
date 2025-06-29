import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  candidateName: string;
  examTitle: string;
  score: number;
  date: string;
  certificateId: string;
}

export const generateCertificate = async (data: CertificateData): Promise<string> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Set background color
  pdf.setFillColor(10, 25, 47); // primary-dark
  pdf.rect(0, 0, 297, 210, 'F');

  // Add decorative elements
  pdf.setFillColor(255, 79, 0); // primary-orange
  pdf.rect(0, 0, 297, 15, 'F');
  pdf.rect(0, 195, 297, 15, 'F');

  // Add title
  pdf.setTextColor(245, 245, 245); // primary-white
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE OF COMPLETION', 148.5, 40, { align: 'center' });

  // Add subtitle
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is to certify that', 148.5, 60, { align: 'center' });

  // Add candidate name
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 79, 0); // primary-orange
  pdf.text(data.candidateName.toUpperCase(), 148.5, 80, { align: 'center' });

  // Add completion text
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(245, 245, 245); // primary-white
  pdf.text('has successfully completed the examination', 148.5, 100, { align: 'center' });

  // Add exam title
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 212, 255); // robotic-blue
  pdf.text(data.examTitle, 148.5, 120, { align: 'center' });

  // Add score
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(245, 245, 245); // primary-white
  pdf.text(`with a score of ${data.score}%`, 148.5, 140, { align: 'center' });

  // Add date
  pdf.setFontSize(14);
  pdf.text(`Date: ${data.date}`, 148.5, 160, { align: 'center' });

  // Add certificate ID
  pdf.setFontSize(12);
  pdf.setTextColor(74, 74, 74); // primary-gray
  pdf.text(`Certificate ID: ${data.certificateId}`, 148.5, 175, { align: 'center' });

  // Generate QR code
  const qrCodeDataURL = await QRCode.toDataURL(
    `https://examforge.com/verify/${data.certificateId}`,
    {
      width: 80,
      margin: 1,
      color: {
        dark: '#0A192F',
        light: '#F5F5F5'
      }
    }
  );

  // Add QR code
  pdf.addImage(qrCodeDataURL, 'PNG', 20, 140, 25, 25);
  pdf.setFontSize(10);
  pdf.text('Scan to verify', 32.5, 175, { align: 'center' });

  // Add signature line
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(255, 79, 0);
  pdf.line(200, 170, 270, 170);
  pdf.setFontSize(12);
  pdf.text('Authorized Signature', 235, 180, { align: 'center' });

  return pdf.output('datauristring');
};