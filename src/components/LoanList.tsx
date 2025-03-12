
import { useState } from "react";
import { Loan } from "../models/loanTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Info, Plus, Trash } from "lucide-react";
import { formatCurrency, formatDate, formatPercentage } from "../utils/loanCalculations";
import { toast } from "@/hooks/use-toast";

interface LoanListProps {
  loans: Loan[];
  onDeleteLoan: (id: string) => void;
  onAddPayment: (loanId: string, amount: number) => void;
}

export const LoanList: React.FC<LoanListProps> = ({ loans, onDeleteLoan, onAddPayment }) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  
  const handleAddPayment = () => {
    if (!selectedLoanId || !paymentAmount) {
      toast({
        title: "Missing information",
        description: "Please select a loan and enter a payment amount.",
        variant: "destructive"
      });
      return;
    }
    
    onAddPayment(selectedLoanId, Number(paymentAmount));
    
    // Reset form
    setPaymentAmount("");
    
    toast({
      title: "Payment added",
      description: `Payment of ${formatCurrency(Number(paymentAmount))} has been recorded.`
    });
  };
  
  const getSelectedLoan = () => {
    return loans.find(loan => loan.id === selectedLoanId);
  };
  
  if (loans.length === 0) {
    return (
      <Card className="glass-card animate-fadeIn">
        <CardHeader>
          <CardTitle>Loans</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No loans added yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add your first loan to start tracking</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Loans</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Payment</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record a Payment</DialogTitle>
              <DialogDescription>
                Add a payment to one of your existing loans.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="loan-select">Select Loan</Label>
                <select
                  id="loan-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedLoanId || ""}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                >
                  <option value="">Select a loan...</option>
                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount ($)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="e.g., 200"
                  min="0.01"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPayment}>Add Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {loans.map((loan) => {
          const totalPaid = loan.paymentsMade.reduce((sum, payment) => sum + payment.amount, 0);
          const remainingPrincipal = loan.principal - loan.paymentsMade.reduce((sum, payment) => sum + payment.principal, 0);
          
          return (
            <Card key={loan.id} className="overflow-hidden animate-slideUp">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{loan.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteLoan(loan.id)}
                  >
                    <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                    <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Principal</span>
                        <div className="font-medium">{formatCurrency(loan.principal)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interest Rate</span>
                        <div className="font-medium">{formatPercentage(loan.interestRate)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monthly Payment</span>
                        <div className="font-medium">{formatCurrency(loan.minimumPayment)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Loan Term</span>
                        <div className="font-medium">{loan.loanTerm} months</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Paid</span>
                        <div className="font-medium">{formatCurrency(totalPaid)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining</span>
                        <div className="font-medium">{formatCurrency(remainingPrincipal)}</div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payments">
                    {loan.paymentsMade.length > 0 ? (
                      <div className="max-h-[200px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Principal</TableHead>
                              <TableHead className="text-right">Interest</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loan.paymentsMade.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.date)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(payment.principal)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(payment.interest)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No payments recorded yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
