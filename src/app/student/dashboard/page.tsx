"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Wallet, FileText, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateReceipt } from "@/lib/generateReceipt";

export default function StudentDashboard() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

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

  const activeFee = fees.length > 0 ? fees[0] : null; // Most recent month
  const totalPending = fees.reduce((acc, f) => acc + (f.amount - f.amountPaid), 0);
  const isClear = totalPending === 0;

  const downloadReceipt = (payment: any) => {
    // Find the associated fee
    const fee = fees.find(f => f._id === payment.feeId);
    if (!fee) {
      toast({ variant: "destructive", title: "Error", description: "Fee details not found for receipt" });
      return;
    }
    generateReceipt(payment, fee, fee.studentId);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Your Portal...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
          <p className="text-muted-foreground">Welcome back! Manage your fee statuses below.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">{fees[0]?.studentId?.name || "Student"}</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{fees[0]?.studentId?.admissionNumber}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`border ${isClear ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isClear ? "text-green-700" : "text-red-700"}`}>Current Status</CardTitle>
            {isClear ? <Wallet className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            {isClear ? (
              <>
                <div className="text-2xl font-bold text-green-700">All Clear!</div>
                <p className="text-xs text-green-600/80 mt-1">You have no pending dues.</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-700">₹{totalPending}</div>
                <p className="text-xs text-red-600/80 mt-1">Total pending dues</p>
              </>
            )}
          </CardContent>
        </Card>

        {activeFee && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Month: {format(new Date(2000, activeFee.month - 1, 1), 'MMMM')} {activeFee.year}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-foreground">₹{activeFee.amount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total Fee Amount</p>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${activeFee.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    Status: {activeFee.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">Paid: ₹{activeFee.amountPaid}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
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
                payments.slice(0, 5).map((pay) => (
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
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent payments.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
