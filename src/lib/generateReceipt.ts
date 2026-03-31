import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateReceipt = (payment: any, fee: any, student: any) => {
  const doc = new jsPDF();

  const title = "MADRASSA FEE RECEIPT";
  const dateStr = `Date: ${new Date(payment.date).toLocaleDateString()}`;
  const receiptNo = `Receipt No: ${payment.receiptNumber}`;

  doc.setFontSize(18);
  doc.text(title, 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(receiptNo, 14, 35);
  doc.text(dateStr, 140, 35);

  doc.text("Student Details:", 14, 45);
  doc.setFontSize(10);
  doc.text(`Name: ${student.name}`, 14, 52);
  doc.text(`Admission No: ${student.admissionNumber}`, 14, 58);
  doc.text(`Class: ${student.classId?.name || 'N/A'}`, 14, 64);
  doc.text(`Parent: ${student.parentName}`, 14, 70);

  // Use autoTable for payment details
  (doc as any).autoTable({
    startY: 80,
    head: [["Description", "Fee Period", "Amount Paid"]],
    body: [
      [`Madrassa Monthly Fee`, `${fee.month}/${fee.year}`, `Rs. ${payment.amount}`]
    ],
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;
  
  doc.text(`Payment Method: ${payment.method.toUpperCase()}`, 14, finalY + 10);
  doc.text(`Remaining Due for ${fee.month}/${fee.year}: Rs. ${fee.amount - fee.amountPaid}`, 14, finalY + 16);

  doc.text("-----------------------", 150, finalY + 30);
  doc.text("Authorized Signature", 150, finalY + 36);

  // Download
  doc.save(`${student.admissionNumber}-receipt-${payment.receiptNumber}.pdf`);
};
