"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MessageCircle, Send } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReportsPage() {
  const [unpaidFees, setUnpaidFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnpaidFees();
  }, []);

  const fetchUnpaidFees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports?type=unpaid_list");
      const data = await res.json();
      setUnpaidFees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppLink = (fee: any) => {
    const phone = fee.studentId?.phone.replace(/[^0-9]/g, ""); // strip non-numeric
    const studentName = fee.studentId?.name;
    const amountDue = fee.amount - fee.amountPaid;
    const monthYear = `${fee.month}/${fee.year}`;
    
    const message = `Assalamu Alaikum, dear parent.\n\nThis is a gentle reminder from the Madrassa regarding pending fees for ${studentName}.\n\nMonth: ${monthYear}\nAmount Due: Rs. ${amountDue}\n\nPlease pay at your earliest convenience. Jazakallah Khair.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const sendReminder = (fee: any) => {
    const link = generateWhatsAppLink(fee);
    window.open(link, "_blank");
  };

  const sendBulkReminders = () => {
    if (!confirm(`This will open WhatsApp for ${unpaidFees.length} students. Ensure pop-ups are allowed. Proceed?`)) return;
    unpaidFees.forEach((fee, index) => {
      setTimeout(() => {
        sendReminder(fee);
      }, index * 2000); // 2 second delay between openings to prevent browser blocking
    });
  };

  const exportCSV = () => {
    const data = unpaidFees.map(f => ({
      AdmissionNo: f.studentId?.admissionNumber,
      StudentName: f.studentId?.name,
      Phone: f.studentId?.phone,
      MonthYear: `${f.month}/${f.year}`,
      TotalFee: f.amount,
      Paid: f.amountPaid,
      Pending: f.amount - f.amountPaid,
      DueDate: new Date(f.dueDate).toLocaleDateString()
    }));
    
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `unpaid_reports_${new Date().getTime()}.csv`;
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Unpaid Fees Report", 14, 15);
    
    const tableData = unpaidFees.map(f => [
      f.studentId?.admissionNumber,
      f.studentId?.name,
      f.studentId?.phone,
      `${f.month}/${f.year}`,
      `Rs. ${f.amount - f.amountPaid}`
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [["Adm No", "Name", "Phone", "Month/Year", "Pending"]],
      body: tableData,
    });

    doc.save(`unpaid_reports_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Reminders</h1>
          <p className="text-muted-foreground">View reports and send payment reminders.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" onClick={exportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="default" onClick={sendBulkReminders} disabled={unpaidFees.length === 0}>
            <Send className="mr-2 h-4 w-4" /> Send Bulk Reminders
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unpaid Dues</CardTitle>
          <CardDescription>A list of students with pending fee payments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Student</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="w-[150px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
              ) : unpaidFees.length > 0 ? (
                unpaidFees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{fee.studentId?.name}</div>
                      <div className="text-xs text-muted-foreground">{fee.studentId?.phone}</div>
                    </TableCell>
                    <TableCell>{fee.month}/{fee.year}</TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell className="font-semibold text-red-600">₹{fee.amount - fee.amountPaid}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => sendReminder(fee)} className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center py-6">All clear! No unpaid dues found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
