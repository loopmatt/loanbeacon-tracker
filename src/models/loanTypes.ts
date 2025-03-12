
export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number; // Annual interest rate in percentage
  loanTerm: number; // In months
  startDate: string; // ISO date string
  minimumPayment: number;
  paymentsMade: Payment[];
  category?: LoanCategory; // Optional loan category
  dueDay?: number; // Day of month when payment is due
  notes?: string; // Optional notes about the loan
}

export type LoanCategory = 'federal' | 'private' | 'personal' | 'other';

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

export interface PaymentReminder {
  loanId: string;
  dueDate: string; // ISO date string
  amount: number;
  isPaid: boolean;
}
