
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Wallet, Calendar, ArrowDown } from "lucide-react";
import { Loan, LoanSummary } from "../models/loanTypes";
import { calculateLoanSummary, formatCurrency, formatDate } from "../utils/loanCalculations";

interface ExtraPaymentSimulatorProps {
  loans: Loan[];
  additionalPayment: number;
  onAdditionalPaymentChange: (amount: number) => void;
}

export const ExtraPaymentSimulator: React.FC<ExtraPaymentSimulatorProps> = ({ 
  loans, 
  additionalPayment, 
  onAdditionalPaymentChange 
}) => {
  const [baselineSummary, setBaselineSummary] = useState<LoanSummary | null>(null);
  const [enhancedSummary, setEnhancedSummary] = useState<LoanSummary | null>(null);
  const [maxAdditional, setMaxAdditional] = useState(1000);
  const [sliderValue, setSliderValue] = useState(additionalPayment);
  
  useEffect(() => {
    if (loans.length === 0) return;
    
    // Calculate combined loan summary for baseline (no additional payment)
    const combinedLoan: Loan = {
      id: "combined",
      name: "All Loans",
      principal: loans.reduce((sum, loan) => sum + loan.principal, 0),
      interestRate: loans.reduce((sum, loan) => sum + (loan.principal * loan.interestRate), 0) / 
                    loans.reduce((sum, loan) => sum + loan.principal, 0),
      loanTerm: Math.max(...loans.map(loan => loan.loanTerm)),
      startDate: loans[0].startDate,
      minimumPayment: loans.reduce((sum, loan) => sum + loan.minimumPayment, 0),
      paymentsMade: loans.flatMap(loan => loan.paymentsMade)
    };
    
    const baseline = calculateLoanSummary(combinedLoan, 0);
    const enhanced = calculateLoanSummary(combinedLoan, additionalPayment);
    
    setBaselineSummary(baseline);
    setEnhancedSummary(enhanced);
    
    // Set max additional payment to 50% of total minimum payment
    setMaxAdditional(combinedLoan.minimumPayment * 0.5);
  }, [loans, additionalPayment]);
  
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
    onAdditionalPaymentChange(value[0]);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSliderValue(value);
    onAdditionalPaymentChange(value);
  };
  
  if (loans.length === 0 || !baselineSummary || !enhancedSummary) {
    return null;
  }
  
  // Calculate differences
  const timeSaved = new Date(baselineSummary.payoffDate).getTime() - new Date(enhancedSummary.payoffDate).getTime();
  const monthsSaved = Math.round(timeSaved / (1000 * 60 * 60 * 24 * 30));
  const interestSaved = baselineSummary.totalInterest - enhancedSummary.totalInterest;
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold tracking-tight">Extra Payment Impact</h2>
      
      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle>Simulate Extra Payments</CardTitle>
          <CardDescription>
            See how additional monthly payments can impact your loan repayment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="additional-payment">Monthly Extra Payment</Label>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4 items-center">
              <Slider
                value={[sliderValue]}
                max={maxAdditional}
                step={10}
                onValueChange={handleSliderChange}
                aria-label="Extra payment amount"
              />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-sm text-muted-foreground">$</span>
                </div>
                <Input
                  id="additional-payment"
                  type="number"
                  value={sliderValue}
                  onChange={handleInputChange}
                  min={0}
                  max={maxAdditional}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-secondary/50 border-none">
              <CardHeader className="p-4 pb-2">
                <CardDescription>Months Saved</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{monthsSaved}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50 border-none">
              <CardHeader className="p-4 pb-2">
                <CardDescription>Interest Saved</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{formatCurrency(interestSaved)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50 border-none">
              <CardHeader className="p-4 pb-2">
                <CardDescription>New Payoff Date</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-bold">{formatDate(enhancedSummary.payoffDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Standard Repayment</h3>
                <p className="text-xs text-muted-foreground">No extra payments</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatDate(baselineSummary.payoffDate)}</div>
                <div className="text-xs text-muted-foreground">Payoff date</div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">With Extra Payments</h3>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(sliderValue)} additional per month
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatDate(enhancedSummary.payoffDate)}</div>
                <div className="text-xs text-muted-foreground">New payoff date</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
