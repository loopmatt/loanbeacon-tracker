
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, Calendar, DollarSign, PiggyBank, Wallet } from "lucide-react";
import { Loan, LoanSummary } from "../models/loanTypes";
import { formatCurrency, formatDate, formatPercentage, calculateLoanSummary } from "../utils/loanCalculations";
import { ProgressBar } from "./ProgressBar";

interface DashboardProps {
  loans: Loan[];
  additionalPayment: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ loans, additionalPayment }) => {
  const [totalSummary, setTotalSummary] = useState<LoanSummary | null>(null);
  
  useEffect(() => {
    if (loans.length === 0) return;
    
    // Calculate combined loan summary
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
    
    setTotalSummary(calculateLoanSummary(combinedLoan, additionalPayment));
  }, [loans, additionalPayment]);
  
  if (!totalSummary) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-muted rounded-lg"></div>
          <div className="h-28 bg-muted rounded-lg"></div>
          <div className="h-28 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main stats card */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">Loan Overview</CardTitle>
          <CardDescription>Summary of all your student loans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Balance</h3>
                <div className="text-3xl font-semibold tracking-tight">
                  {formatCurrency(totalSummary.remainingBalance)}
                </div>
                <ProgressBar 
                  value={totalSummary.progressPercentage} 
                  className="mt-2 h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>{formatPercentage(totalSummary.progressPercentage)}</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Monthly Payment</h3>
                <div className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(totalSummary.monthlyPayment)}
                </div>
                {additionalPayment > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    Includes {formatCurrency(additionalPayment)} extra payment
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Projected Payoff Date</h3>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-primary mr-2" />
                  <span className="text-lg font-medium">{formatDate(totalSummary.payoffDate)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Principal</h3>
                  <div className="flex items-center mt-1">
                    <Wallet className="h-4 w-4 text-primary mr-2" />
                    <span className="text-lg font-medium">{formatCurrency(totalSummary.totalPrincipal)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Interest</h3>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="h-4 w-4 text-destructive mr-2" />
                    <span className="text-lg font-medium">{formatCurrency(totalSummary.totalInterest)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total to be Paid</h3>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-primary mr-2" />
                  <span className="text-lg font-medium">{formatCurrency(totalSummary.totalPayments)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Per loan summary */}
      {loans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => {
            const summary = calculateLoanSummary(loan, 0);
            const totalPaid = loan.paymentsMade.reduce((sum, payment) => sum + payment.amount, 0);
            
            return (
              <Card key={loan.id} className="overflow-hidden hover:shadow-md transition-shadow animate-slideUp">
                <CardHeader className="pb-2">
                  <CardTitle>{loan.name}</CardTitle>
                  <CardDescription>
                    {formatPercentage(loan.interestRate)} interest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="text-lg font-semibold">{formatCurrency(summary.remainingBalance)}</span>
                  </div>
                  <ProgressBar 
                    value={summary.progressPercentage} 
                    className="h-1.5"
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Monthly</span>
                      <div className="font-medium">{formatCurrency(loan.minimumPayment)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid so far</span>
                      <div className="font-medium">{formatCurrency(totalPaid)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
