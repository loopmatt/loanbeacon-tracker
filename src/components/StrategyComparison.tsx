
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loan, RepaymentStrategy } from "../models/loanTypes";
import { simulateRepaymentStrategy, formatCurrency, formatDate } from "../utils/loanCalculations";
import { ArrowDown01, ArrowDownAZ, Check } from "lucide-react";

interface StrategyComparisonProps {
  loans: Loan[];
  additionalPayment: number;
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({ loans, additionalPayment }) => {
  const [avalancheStrategy, setAvalancheStrategy] = useState<RepaymentStrategy | null>(null);
  const [snowballStrategy, setSnowballStrategy] = useState<RepaymentStrategy | null>(null);
  
  useEffect(() => {
    if (loans.length <= 1) return;
    
    // Calculate both strategies
    const avalanche = simulateRepaymentStrategy(loans, 'avalanche', additionalPayment);
    const snowball = simulateRepaymentStrategy(loans, 'snowball', additionalPayment);
    
    setAvalancheStrategy(avalanche);
    setSnowballStrategy(snowball);
  }, [loans, additionalPayment]);
  
  if (loans.length <= 1 || !avalancheStrategy || !snowballStrategy) {
    return null;
  }
  
  const avalancheIsBetter = avalancheStrategy.totalInterestPaid < snowballStrategy.totalInterestPaid;
  const interestSavings = Math.abs(avalancheStrategy.totalInterestPaid - snowballStrategy.totalInterestPaid);
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold tracking-tight">Repayment Strategy Comparison</h2>
      
      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle>Choose the Best Strategy</CardTitle>
          <CardDescription>
            Compare the Avalanche and Snowball methods to find which works best for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comparison">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="comparison" className="flex-1">Comparison</TabsTrigger>
              <TabsTrigger value="avalanche" className="flex-1">Avalanche Method</TabsTrigger>
              <TabsTrigger value="snowball" className="flex-1">Snowball Method</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ArrowDownAZ className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Avalanche Method</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Focuses on paying off loans with the highest interest rates first,
                    saving you the most money in interest over time.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-medium">{formatCurrency(avalancheStrategy.totalInterestPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payoff Date</span>
                      <span className="font-medium">{formatDate(avalancheStrategy.payoffDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ArrowDown01 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Snowball Method</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Focuses on paying off loans with the lowest balances first,
                    giving you psychological wins to keep you motivated.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-medium">{formatCurrency(snowballStrategy.totalInterestPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payoff Date</span>
                      <span className="font-medium">{formatDate(snowballStrategy.payoffDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="my-6 border-t border-border pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                  {avalancheIsBetter ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">The Avalanche method will save you approximately</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-500">
                        {formatCurrency(interestSavings)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By paying off high-interest loans first
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="font-medium">The Snowball method will save you approximately</span>
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        {formatCurrency(interestSavings)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        While also providing motivational quick wins
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="avalanche">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">How the Avalanche Method Works</h3>
                  <p className="text-sm text-muted-foreground">
                    The Avalanche method prioritizes loans with the highest interest rates first. 
                    You make minimum payments on all loans, but put any extra money toward the 
                    loan with the highest interest rate. This saves you the most money over time.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Payoff Order with Avalanche Method</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {avalancheStrategy.loanPayoffOrder.map((loanName, index) => (
                      <li key={index} className="text-sm pl-2">
                        {loanName}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="snowball">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">How the Snowball Method Works</h3>
                  <p className="text-sm text-muted-foreground">
                    The Snowball method prioritizes loans with the lowest balances first. 
                    You make minimum payments on all loans, but put any extra money toward the 
                    loan with the smallest balance. This gives you quick wins to stay motivated.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Payoff Order with Snowball Method</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {snowballStrategy.loanPayoffOrder.map((loanName, index) => (
                      <li key={index} className="text-sm pl-2">
                        {loanName}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
