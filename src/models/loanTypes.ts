
export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number; // Annual interest rate in percentage
  loanTerm: number; // In months
  startDate: string; // ISO date string
  minimumPayment: number;
  paymentsMade: Payment[];
}

export interface Payment {
  id: string;
  date: string; // ISO date string
  amount: number;
  principal: number;
  interest: number;
}

export interface AmortizationData {
  date: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface LoanSummary {
  totalPrincipal: number;
  totalInterest: number;
  totalPayments: number;
  payoffDate: string;
  monthlyPayment: number;
  remainingBalance: number;
  progressPercentage: number;
}

export interface RepaymentStrategy {
  name: string;
  description: string;
  totalInterestPaid: number;
  payoffDate: string;
  loanPayoffOrder: string[];
}

export type RepaymentMethod = 'avalanche' | 'snowball';
