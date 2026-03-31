"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileDown, CheckCircle, Smartphone } from "lucide-react";

export default function AdminFeesPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [filterMonth, setFilterMonth] = useState(currentMonth.toString());
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: filterMonth,
        year: filterYear,
        status: filterStatus
      });

      const res = await fetch(`/api/fees?${params.toString()}`);
      const data = await res.json();
      setFees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear, filterStatus]);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerateLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/fees/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: formData.get("month"),
          year: formData.get("year"),
          dueDate: formData.get("dueDate"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation Failed");
      toast({ title: "Success", description: data.message });
      setGenerateOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = Number(new FormData(e.currentTarget).get("amount"));
    const method = new FormData(e.currentTarget).get("method") as string;
    
    if (amount <= 0 || amount > (selectedFee.amount - selectedFee.amountPaid)) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Payment must be between 1 and due balance" });
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeId: selectedFee._id,
          studentId: selectedFee.studentId._id,
          amountPaid: amount,
          method
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Payment Recorded", description: `Receipt: ${data.payment.receiptNumber}` });
      setPayOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }
  
  const filteredFees = fees.filter(f => 
    !search || f.studentId?.name.toLowerCase().includes(search.toLowerCase()) || f.studentId?.admissionNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fees Management</h1>
          <p className="text-muted-foreground">Manage and track student fee collections.</p>
        </div>
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Generate Monthly Fees</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate Fees for Class</DialogTitle></DialogHeader>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select name="month" defaultValue={currentMonth.toString()}>
                    <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <SelectItem key={m} value={m.toString()}>{format(new Date(2000, m - 1, 1), 'MMMM')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input name="year" type="number" defaultValue={currentYear} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input name="dueDate" type="date" required />
              </div>
              <Button type="submit" className="w-full" disabled={generateLoading}>Generate for Active Students</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search student..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <SelectItem key={m} value={m.toString()}>{format(new Date(2000, m - 1, 1), 'MMMM')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
              ) : filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{fee.studentId?.name}</div>
                      <div className="text-xs text-muted-foreground">{fee.studentId?.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{fee.studentId?.classId?.name}</TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>₹{fee.amountPaid}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.status === 'paid' ? 'bg-green-100 text-green-700' : fee.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {fee.status !== "paid" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedFee(fee); setPayOpen(true); }}>
                            Pay
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center py-6">No fees match criteria.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="grid gap-2 text-sm bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between"><span>Student:</span> <strong>{selectedFee?.studentId?.name}</strong></div>
              <div className="flex justify-between"><span>Total Fee:</span> <strong>₹{selectedFee?.amount}</strong></div>
              <div className="flex justify-between"><span>Already Paid:</span> <strong>₹{selectedFee?.amountPaid}</strong></div>
              <div className="flex justify-between text-red-600"><span>Remaining Due:</span> <strong>₹{selectedFee ? selectedFee.amount - selectedFee.amountPaid : 0}</strong></div>
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Paying Amount (₹)</label>
              <Input name="amount" type="number" max={selectedFee ? selectedFee.amount - selectedFee.amountPaid : 0} defaultValue={selectedFee ? selectedFee.amount - selectedFee.amountPaid : 0} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select name="method" defaultValue="cash">
                <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer/UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
              <Button type="submit">Complete Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
