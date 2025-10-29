import jsPDF from 'jspdf';

// Define types for form data
interface MembershipFormData {
  applicationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fatherName?: string;
  motherName?: string;
  photoUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  occupation?: string;
  education?: string;
  organization?: string;
  englishLevel?: string;
  frenchLevel?: string;
  kinyarwandaLevel?: string;
  skills: string[];
  workExperience?: string;
  interests: string[];
  whyJoin: string;
  membershipCategory?: string;
  reference1Name?: string;
  reference1Contact?: string;
  reference1Relationship?: string;
  reference2Name?: string;
  reference2Contact?: string;
  reference2Relationship?: string;
  dataConsent: boolean;
  termsAccepted: boolean;
  codeOfConductAccepted: boolean;
  communicationConsent: boolean;
}

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} years`;
};

// Function to generate the PDF
export const generateMembershipPDF = async (formData: MembershipFormData): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let yPos = 0;

  // ========================================
  // HEADER SECTION
  // ========================================
  
  const addHeader = async () => {
    // Purple gradient background for header
    pdf.setFillColor(139, 92, 246); // Purple
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    // Add decorative top border
    pdf.setFillColor(207, 181, 59); // Golden
    pdf.rect(0, 0, pageWidth, 3, 'F');
    
    // Try to add logo
    try {
      const logoResponse = await fetch('/benirage.png');
      const logoBlob = await logoResponse.blob();
      const logoData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
      pdf.addImage(logoData, 'PNG', margin, 8, 25, 25);
    } catch (error) {
      console.warn('Logo not loaded:', error);
      // Draw placeholder circle
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(2);
      pdf.circle(margin + 12.5, 20.5, 12, 'S');
    }
    
    // Organization name and title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BENIRAGE', margin + 35, 18);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Grounded in Spirit, Guided by Wisdom, Rooted in Culture', margin + 35, 25);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MEMBERSHIP APPLICATION', margin + 35, 35);
    
    // Status badge (top right)
    pdf.setFillColor(34, 197, 94); // Green
    pdf.roundedRect(pageWidth - margin - 35, 8, 30, 10, 2, 2, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓ APPROVED', pageWidth - margin - 20, 14.5, { align: 'center' });
    
    // Application ID box
    pdf.setFillColor(251, 191, 36); // Yellow
    pdf.roundedRect(margin, 48, contentWidth, 12, 2, 2, 'F');
    pdf.setTextColor(146, 64, 14); // Dark yellow
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    const appId = formData.applicationId || 'N/A';
    pdf.text(`Application ID: ${appId}`, pageWidth / 2, 56, { align: 'center' });
    
    yPos = 65;
  };

  // ========================================
  // BODY SECTION
  // ========================================
  
  const addSectionTitle = (title: string, icon: string) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = margin;
    }
    
    // Section background
    pdf.setFillColor(248, 250, 252); // Light gray
    pdf.roundedRect(margin, yPos, contentWidth, 10, 1, 1, 'F');
    
    // Section title
    pdf.setTextColor(5, 41, 75); // Dark blue
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${icon} ${title}`, margin + 3, yPos + 7);
    
    // Decorative line
    pdf.setDrawColor(207, 181, 59); // Golden
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos + 11, pageWidth - margin, yPos + 11);
    
    yPos += 15;
  };
  
  const addField = (label: string, value: string, inline: boolean = false) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128); // Gray
    pdf.text(label, margin + 2, yPos);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55); // Dark gray
    pdf.setFontSize(10);
    
    if (inline) {
      pdf.text(value || 'N/A', margin + 50, yPos);
      yPos += 6;
    } else {
      const lines = pdf.splitTextToSize(value || 'N/A', contentWidth - 4);
      pdf.text(lines, margin + 2, yPos + 5);
      yPos += (lines.length * 5) + 8;
    }
  };
  
  const addTwoColumnFields = (label1: string, value1: string, label2: string, value2: string) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    
    const colWidth = contentWidth / 2 - 2;
    
    // Left column
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text(label1, margin + 2, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(10);
    pdf.text(value1 || 'N/A', margin + 2, yPos + 5);
    
    // Right column
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text(label2, margin + colWidth + 4, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(10);
    pdf.text(value2 || 'N/A', margin + colWidth + 4, yPos + 5);
    
    yPos += 12;
  };
  
  const addCheckboxList = (items: { label: string; checked: boolean }[]) => {
    items.forEach(item => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(31, 41, 55);
      
      // Checkbox
      pdf.setDrawColor(107, 114, 128);
      pdf.setLineWidth(0.3);
      pdf.rect(margin + 2, yPos - 3, 4, 4, 'S');
      
      if (item.checked) {
        pdf.setTextColor(34, 197, 94); // Green
        pdf.setFontSize(12);
        pdf.text('✓', margin + 3.5, yPos + 0.5, { align: 'center' });
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(10);
      }
      
      pdf.text(item.label, margin + 8, yPos);
      yPos += 6;
    });
  };

  // ========================================
  // BUILD THE PDF
  // ========================================
  
  await addHeader();
  
  // Applicant Photo and Basic Info Box
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'FD');
  
  // Add photo
  if (formData.photoUrl) {
    try {
      let imgData: string;
      if (formData.photoUrl.startsWith('data:')) {
        imgData = formData.photoUrl;
      } else {
        const response = await fetch(formData.photoUrl);
        const blob = await response.blob();
        imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      pdf.addImage(imgData, 'JPEG', margin + 5, yPos + 5, 25, 25);
    } catch (error) {
      console.warn('Photo not loaded:', error);
      pdf.setDrawColor(209, 213, 219);
      pdf.setLineWidth(1);
      pdf.rect(margin + 5, yPos + 5, 25, 25, 'S');
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Photo', margin + 17.5, yPos + 18, { align: 'center' });
    }
  } else {
    // Placeholder
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(1);
    pdf.rect(margin + 5, yPos + 5, 25, 25, 'S');
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text('No Photo', margin + 17.5, yPos + 18, { align: 'center' });
  }
  
  // Applicant name and details
  pdf.setTextColor(5, 41, 75);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${formData.firstName} ${formData.lastName}`, margin + 35, yPos + 12);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text(formData.membershipCategory || 'Member Applicant', margin + 35, yPos + 18);
  pdf.text(`Age: ${calculateAge(formData.dateOfBirth || '')} | Gender: ${formData.gender || 'N/A'}`, margin + 35, yPos + 24);
  pdf.text(`📧 ${formData.email}`, margin + 35, yPos + 30);
  
  yPos += 40;
  
  // Personal Information
  addSectionTitle('👤 Personal Information', '');
  addTwoColumnFields('First Name', formData.firstName, 'Last Name', formData.lastName);
  addTwoColumnFields('Email Address', formData.email, 'Phone Number', formData.phone);
  if (formData.fatherName || formData.motherName) {
    addTwoColumnFields('Father\'s Name', formData.fatherName || 'N/A', 'Mother\'s Name', formData.motherName || 'N/A');
  }
  addTwoColumnFields('Gender', formData.gender || 'N/A', 'Date of Birth', formData.dateOfBirth || 'N/A');
  yPos += 5;
  
  // Location Information
  addSectionTitle('📍 Location Information', '');
  addTwoColumnFields('Country', formData.country || 'N/A', 'District/Province', formData.district || 'N/A');
  addTwoColumnFields('Sector/Commune', formData.sector || 'N/A', 'Cell/Ward', formData.cell || 'N/A');
  addField('Village/Zone', formData.village || 'N/A', true);
  yPos += 5;
  
  // Education & Professional Background
  addSectionTitle('🎓 Education & Professional Background', '');
  addTwoColumnFields('Occupation', formData.occupation || 'N/A', 'Education Level', formData.education || 'N/A');
  addField('Organization/Institution', formData.organization || 'N/A', true);
  
  if (formData.workExperience) {
    addField('Work Experience', formData.workExperience);
  }
  yPos += 5;
  
  // Language Proficiency
  addSectionTitle('🌐 Language Proficiency', '');
  addTwoColumnFields('English', formData.englishLevel || 'N/A', 'French', formData.frenchLevel || 'N/A');
  addField('Kinyarwanda', formData.kinyarwandaLevel || 'N/A', true);
  yPos += 5;
  
  // Skills & Expertise
  addSectionTitle('⚡ Skills & Expertise', '');
  if (formData.skills.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55);
    
    formData.skills.forEach((skill) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = margin;
      }
      
      // Bullet point
      pdf.setFillColor(207, 181, 59); // Golden
      pdf.circle(margin + 3, yPos - 1.5, 1, 'F');
      pdf.text(skill, margin + 7, yPos);
      yPos += 5;
    });
    yPos += 3;
  } else {
    addField('Skills', 'None specified', true);
  }
  yPos += 5;
  
  // Areas of Interest
  addSectionTitle('💡 Areas of Interest', '');
  if (formData.interests.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55);
    
    formData.interests.forEach((interest) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = margin;
      }
      
      // Bullet point
      pdf.setFillColor(139, 92, 246); // Purple
      pdf.circle(margin + 3, yPos - 1.5, 1, 'F');
      pdf.text(interest, margin + 7, yPos);
      yPos += 5;
    });
    yPos += 3;
  } else {
    addField('Interests', 'None specified', true);
  }
  yPos += 5;
  
  // Motivation
  addSectionTitle('❓ Motivation for Joining', '');
  addField('Why do you want to join BENIRAGE?', formData.whyJoin);
  yPos += 5;
  
  // References
  addSectionTitle('📞 References', '');
  if (formData.reference1Name) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 41, 75);
    pdf.text('Reference 1', margin + 2, yPos);
    yPos += 6;
    
    addTwoColumnFields('Name', formData.reference1Name, 'Contact', formData.reference1Contact || 'N/A');
    addField('Relationship', formData.reference1Relationship || 'N/A', true);
    yPos += 3;
  }
  
  if (formData.reference2Name) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 41, 75);
    pdf.text('Reference 2', margin + 2, yPos);
    yPos += 6;
    
    addTwoColumnFields('Name', formData.reference2Name, 'Contact', formData.reference2Contact || 'N/A');
    addField('Relationship', formData.reference2Relationship || 'N/A', true);
    yPos += 3;
  }
  yPos += 5;
  
  // Check if we need a new page for declaration
  if (yPos > pageHeight - 80) {
    pdf.addPage();
    yPos = margin;
  }
  
  // Declaration & Consent Section
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(139, 92, 246);
  pdf.setLineWidth(1);
  pdf.roundedRect(margin, yPos, contentWidth, 55, 2, 2, 'FD');
  
  pdf.setTextColor(5, 41, 75);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Declaration & Consent', margin + 3, yPos + 7);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(31, 41, 55);
  const declaration = 'I hereby declare that all information provided in this application is true and accurate to the best of my knowledge. I understand that any false information may result in rejection of my application or termination of membership.';
  const declarationLines = pdf.splitTextToSize(declaration, contentWidth - 6);
  pdf.text(declarationLines, margin + 3, yPos + 13);
  
  yPos += 25;
  
  // Consent checkboxes
  pdf.setFontSize(9);
  addCheckboxList([
    { label: 'I consent to data collection and processing', checked: formData.dataConsent },
    { label: 'I accept the terms and conditions', checked: formData.termsAccepted },
    { label: 'I agree to follow the Code of Conduct', checked: formData.codeOfConductAccepted },
    { label: 'I consent to receive communications', checked: formData.communicationConsent }
  ]);
  
  yPos += 10;
  
  // Signature Section
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(5, 41, 75);
  pdf.text('Signatures', margin + 2, yPos);
  yPos += 8;
  
  // Three signature boxes
  const sigBoxWidth = (contentWidth - 8) / 3;
  
  // Member signature
  pdf.setDrawColor(209, 213, 219);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, yPos, sigBoxWidth, 25, 'S');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Member', margin + 2, yPos + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(31, 41, 55);
  pdf.text(`${formData.firstName} ${formData.lastName}`, margin + 2, yPos + 15);
  pdf.setFontSize(7);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin + 2, yPos + 22);
  
  // Secretary General signature
  pdf.setDrawColor(209, 213, 219);
  pdf.rect(margin + sigBoxWidth + 4, yPos, sigBoxWidth, 25, 'S');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Secretary General', margin + sigBoxWidth + 6, yPos + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text('Name: ___________________', margin + sigBoxWidth + 6, yPos + 15);
  pdf.text('Date: ___________________', margin + sigBoxWidth + 6, yPos + 22);
  
  // Legal Representative signature
  pdf.setDrawColor(209, 213, 219);
  pdf.rect(margin + (sigBoxWidth * 2) + 8, yPos, sigBoxWidth, 25, 'S');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Legal Representative', margin + (sigBoxWidth * 2) + 10, yPos + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text('Name: ___________________', margin + (sigBoxWidth * 2) + 10, yPos + 15);
  pdf.text('Date: ___________________', margin + (sigBoxWidth * 2) + 10, yPos + 22);
  
  yPos += 30;
  
  // Official Stamp placeholder
  pdf.setDrawColor(207, 181, 59); // Golden
  pdf.setLineWidth(1.5);
  pdf.circle(pageWidth - margin - 20, yPos + 10, 15, 'S');
  pdf.setFontSize(7);
  pdf.setTextColor(107, 114, 128);
  pdf.text('OFFICIAL', pageWidth - margin - 20, yPos + 8, { align: 'center' });
  pdf.text('STAMP', pageWidth - margin - 20, yPos + 13, { align: 'center' });
  
  // ========================================
  // FOOTER SECTION
  // ========================================
  
  const addFooter = async (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 20;
    
    // Footer background
    pdf.setFillColor(5, 41, 75); // Dark blue
    pdf.rect(0, footerY, pageWidth, 20, 'F');
    
    // Golden top border
    pdf.setFillColor(207, 181, 59);
    pdf.rect(0, footerY, pageWidth, 2, 'F');
    
    // Footer content
    pdf.setTextColor(207, 181, 59); // Golden
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BENIRAGE', margin, footerY + 10);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Grounded in Spirit, Guided by Wisdom, Rooted in Culture', margin, footerY + 15);
    
    // Contact info
    pdf.setTextColor(207, 181, 59);
    pdf.text('📧 info@benirage.org', pageWidth / 2 - 20, footerY + 10);
    pdf.text('📱 +250 788 529 611', pageWidth / 2 - 20, footerY + 15);
    
    // Page number
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 12, { align: 'right' });
    
    // Copyright
    pdf.setFontSize(7);
    pdf.setTextColor(156, 163, 175);
    pdf.text('© 2025 BENIRAGE. All rights reserved. | Privacy Policy | Terms of Service', pageWidth / 2, footerY + 18, { align: 'center' });
  };
  
  // Add footer to all pages
  const totalPages = pdf.internal.pages.length - 1; // -1 because first element is null
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    await addFooter(i, totalPages);
  }
  
  // Save the PDF with proper filename
  const filename = `membership_application_${formData.applicationId || crypto.randomUUID()}.pdf`;
  pdf.save(filename);
};