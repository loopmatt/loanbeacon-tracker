
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loan, AmortizationData } from "../models/loanTypes";
import { generateAmortizationSchedule, formatCurrency } from "../utils/loanCalculations";

interface PaymentVisualizationProps {
  loans: Loan[];
  additionalPayment: number;
}

type PieChartData = {
  name: string;
  value: number;
  color: string;
};

export const PaymentVisualization: React.FC<PaymentVisualizationProps> = ({ loans, additionalPayment }) => {
  const [principalData, setPrincipalData] = useState<PieChartData[]>([]);
  const [paymentData, setPaymentData] = useState<PieChartData[]>([]);
  
  useEffect(() => {
    if (loans.length === 0) return;
    
    // Calculate total principal and interest
    let totalPrincipal = 0;
    let totalInterest = 0;
    let paidPrincipal = 0;
    let paidInterest = 0;
    
    loans.forEach(loan => {
      // Calculate paid amounts
      loan.paymentsMade.forEach(payment => {
        paidPrincipal += payment.principal;
        paidInterest += payment.interest;
      });
      
      // Calculate future amounts
      const schedule = generateAmortizationSchedule(loan, additionalPayment);
      schedule.forEach(payment => {
        totalPrincipal += payment.principal;
        totalInterest += payment.interest;
      });
    });
    
    // Adjust totals to include already paid amounts
    totalPrincipal += paidPrincipal;
    totalInterest += paidInterest;
    
    // Create data for the principal vs interest pie chart
    setPrincipalData([
      {
        name: "Principal",
        value: totalPrincipal,
        color: "#3B82F6", // blue-500
      },
      {
        name: "Interest",
        value: totalInterest,
        color: "#EF4444", // red-500
      },
    ]);
    
    // Create data for the payment breakdown pie chart
    setPaymentData([
      {
        name: "Paid Principal",
        value: paidPrincipal,
        color: "#10B981", // emerald-500
      },
      {
        name: "Paid Interest",
        value: paidInterest,
        color: "#F97316", // orange-500
      },
      {
        name: "Remaining Principal",
        value: totalPrincipal - paidPrincipal,
        color: "#6366F1", // indigo-500
      },
      {
        name: "Future Interest",
        value: totalInterest - paidInterest,
        color: "#A855F7", // purple-500
      },
    ]);
  }, [loans, additionalPayment]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    
    return null;
  };
  
  if (loans.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold tracking-tight">Payment Breakdown</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>Principal vs. Interest</CardTitle>
            <CardDescription>See how much of your payments go to principal and interest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={principalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {principalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
              {principalData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">
                    {entry.name}: {formatCurrency(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>Detailed Payment Breakdown</CardTitle>
            <CardDescription>Past and future payments breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {paymentData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
