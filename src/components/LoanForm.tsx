
import { useState } from "react";
import { Loan } from "../models/loanTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMonthlyPayment } from "../utils/loanCalculations";
import { toast } from "@/hooks/use-toast";

interface LoanFormProps {
  onAddLoan: (loan: Loan) => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({ onAddLoan }) => {
  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  
  const handleCalculatePayment = () => {
    if (!principal || !interestRate || !loanTerm) {
      toast({
        title: "Missing information",
        description: "Please fill in principal, interest rate, and loan term.",
        variant: "destructive"
      });
      return;
    }
    
    const calculatedPayment = calculateMonthlyPayment(
      Number(principal),
      Number(interestRate),
      Number(loanTerm)
    );
    
    setMinimumPayment(calculatedPayment.toFixed(2));
    setIsCalculating(true);
    
    // Animate the calculation
    setTimeout(() => setIsCalculating(false), 800);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !principal || !interestRate || !loanTerm || !minimumPayment) {
      toast({
        title: "Missing information",
        description: "Please fill in all loan details.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new loan
    const newLoan: Loan = {
      id: Math.random().toString(36).substring(2),
      name,
      principal: Number(principal),
      interestRate: Number(interestRate),
      loanTerm: Number(loanTerm),
      startDate: new Date().toISOString(),
      minimumPayment: Number(minimumPayment),
      paymentsMade: []
    };
    
    // Add loan
    onAddLoan(newLoan);
    
    // Reset form
    setName("");
    setPrincipal("");
    setInterestRate("");
    setLoanTerm("");
    setMinimumPayment("");
    
    toast({
      title: "Loan added",
      description: `${name} has been added to your loans.`
    });
  };
  
  return (
    <Card className="glass-card shadow-sm animate-fadeIn w-full">
      <CardHeader>
        <CardTitle>Add New Loan</CardTitle>
        <CardDescription>Enter your loan details below</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan-name">Loan Name</Label>
              <Input
                id="loan-name"
                placeholder="e.g., Federal Stafford Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount ($)</Label>
              <Input
                id="principal"
                type="number"
                placeholder="e.g., 10000"
                min="0"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest-rate">Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                placeholder="e.g., 5.5"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan Term (months)</Label>
              <Input
                id="loan-term"
                type="number"
                placeholder="e.g., 120"
                min="1"
                step="1"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="minimum-payment">Monthly Payment ($)</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={handleCalculatePayment}
                >
                  Calculate
                </Button>
              </div>
              <Input
                id="minimum-payment"
                type="number"
                placeholder="e.g., 150"
                min="0"
                step="0.01"
                className={isCalculating ? "animate-pulse bg-primary/10" : ""}
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Add Loan</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
