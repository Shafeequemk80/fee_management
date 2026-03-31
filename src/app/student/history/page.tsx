"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { generateReceipt } from "@/lib/generateReceipt";
import { useToast } from "@/hooks/use-toast";

export default function StudentHistory() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const pendingRes = await fetch("/api/fees?status=all");
      const pendingData = await pendingRes.json();
      setFees(Array.isArray(pendingData) ? pendingData : []);

      const payRes = await fetch("/api/payments");
      const payData = await payRes.json();
      setPayments(Array.isArray(payData) ? payData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (payment: any) => {
    const fee = fees.find(f => f._id === payment.feeId);
    if (!fee) return toast({ variant: "destructive", title: "Error", description: "Fee details not found" });
    generateReceipt(payment, fee, fee.studentId);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading History...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">View all your past payments and download receipts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A complete log of your fee payments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Date</TableHead>
                <TableHead>Receipt No</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((pay) => (
                  <TableRow key={pay._id}>
                    <TableCell className="pl-4">{new Date(pay.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{pay.receiptNumber}</TableCell>
                    <TableCell className="font-semibold text-green-700">₹{pay.amount}</TableCell>
                    <TableCell>{pay.method.toUpperCase()}</TableCell>
                    <TableCell>
                      <button onClick={() => downloadReceipt(pay)} className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium">
                        <Download className="h-4 w-4" /> PDF
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No payment history found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fee Assessment History</CardTitle>
          <CardDescription>All monthly fees assessed to your account.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Month/Year</TableHead>
                <TableHead>Total Assessed</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.length > 0 ? (
                fees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell className="pl-4">{fee.month}/{fee.year}</TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>₹{fee.amountPaid}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.status === 'paid' ? 'bg-green-100 text-green-700' : fee.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No fee history found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
