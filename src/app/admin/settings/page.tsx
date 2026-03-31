"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ClassStructure {
  _id: string;
  name: string;
  monthlyFee: number;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchClasses = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setClasses(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  async function onSubmitClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const monthlyFee = formData.get("monthlyFee") as string;

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, monthlyFee: Number(monthlyFee) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create class");
      }

      toast({
        title: "Success",
        description: "Class created successfully",
      });
      (event.target as HTMLFormElement).reset();
      fetchClasses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteClass(id: string) {
    if (!confirm("Are you sure you want to delete this class? It might break student associations.")) return;
    try {
      const res = await fetch(`/api/classes?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Deleted", description: "Class structure removed" });
      fetchClasses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage application settings and class fee structures.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Class / Fee Structure</CardTitle>
            <CardDescription>Create a new class and define its default monthly fee.</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmitClass}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input id="className" name="name" placeholder="e.g. Hifz 1" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyFee">Default Monthly Fee (₹)</Label>
                <Input id="monthlyFee" name="monthlyFee" type="number" min="0" placeholder="e.g. 500" required disabled={loading} />
              </div>
              <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Class"}</Button>
            </CardContent>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Classes</CardTitle>
            <CardDescription>A list of all active class structures.</CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <p>Loading...</p>
            ) : classes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Required Name</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>₹{cls.monthlyFee}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => deleteClass(cls._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm">No classes found. Add one above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
