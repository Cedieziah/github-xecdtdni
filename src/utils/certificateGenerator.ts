import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  candidateName: string;
  examTitle: string;
  score: number;
  date: string;
  certificateId: string;
  certificateNumber: string;
  provider: string;
}

export const generateCertificatePDF = async (data: CertificateData): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Set background
  pdf.setFillColor(10, 25, 47); // primary-dark
  pdf.rect(0, 0, 297, 210, 'F');

  // Add decorative border
  pdf.setFillColor(255, 79, 0); // primary-orange
  pdf.rect(0, 0, 297, 15, 'F');
  pdf.rect(0, 195, 297, 15, 'F');
  pdf.rect(0, 0, 15, 210, 'F');
  pdf.rect(282, 0, 15, 210, 'F');

  // Add title
  pdf.setTextColor(245, 245, 245); // primary-white
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE OF COMPLETION', 148.5, 50, { align: 'center' });

  // Add subtitle
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is to certify that', 148.5, 70, { align: 'center' });

  // Add candidate name
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 79, 0); // primary-orange
  pdf.text(data.candidateName.toUpperCase(), 148.5, 90, { align: 'center' });

  // Add completion text
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(245, 245, 245); // primary-white
  pdf.text('has successfully completed the examination', 148.5, 110, { align: 'center' });

  // Add exam title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 212, 255); // robotic-blue
  pdf.text(data.examTitle, 148.5, 130, { align: 'center' });

  // Add provider
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(245, 245, 245); // primary-white
  pdf.text(`Provided by ${data.provider}`, 148.5, 145, { align: 'center' });

  // Add score
  pdf.setFontSize(18);
  pdf.text(`with a score of ${data.score}%`, 148.5, 160, { align: 'center' });

  // Add date and certificate number
  pdf.setFontSize(14);
  pdf.text(`Date: ${data.date}`, 80, 175, { align: 'left' });
  pdf.text(`Certificate #: ${data.certificateNumber}`, 217, 175, { align: 'right' });

  // Generate QR code for verification
  const qrCodeDataURL = await QRCode.toDataURL(
    `${window.location.origin}/verify/${data.certificateId}`,
    {
      width: 100,
      margin: 1,
      color: {
        dark: '#0A192F',
        light: '#F5F5F5'
      }
    }
  );

  // Add QR code
  pdf.addImage(qrCodeDataURL, 'PNG', 25, 140, 30, 30);
  pdf.setFontSize(10);
  pdf.setTextColor(245, 245, 245);
  pdf.text('Scan to verify', 40, 180, { align: 'center' });

  // Add signature line
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(255, 79, 0);
  pdf.line(200, 175, 270, 175);
  pdf.setFontSize(12);
  pdf.text('Authorized Signature', 235, 185, { align: 'center' });

  return pdf.output('blob');
};

export const downloadCertificate = async (certificateData: CertificateData) => {
  try {
    const pdfBlob = await generateCertificatePDF(certificateData);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificateData.certificateNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};