
import { 
  Loan, 
  Payment, 
  AmortizationData, 
  LoanSummary, 
  RepaymentStrategy, 
  RepaymentMethod 
} from "../models/loanTypes";

/**
 * Calculate the monthly payment for a loan
 */
export const calculateMonthlyPayment = (principal: number, annualRate: number, termMonths: number): number => {
  // Convert annual rate to monthly decimal
  const monthlyRate = annualRate / 100 / 12;
  
  // If interest rate is 0, simply divide principal by term
  if (monthlyRate === 0) return principal / termMonths;
  
  // Standard amortization formula
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
          (Math.pow(1 + monthlyRate, termMonths) - 1);
};

/**
 * Generate full amortization schedule for a loan
 */
export const generateAmortizationSchedule = (
  loan: Loan,
  additionalPayment: number = 0
): AmortizationData[] => {
  const { principal, interestRate, loanTerm } = loan;
  const monthlyRate = interestRate / 100 / 12;
  const baseMonthlyPayment = calculateMonthlyPayment(principal, interestRate, loanTerm);
  const totalMonthlyPayment = baseMonthlyPayment + additionalPayment;
  
  let balance = principal;
  let date = new Date(loan.startDate);
  const schedule: AmortizationData[] = [];
  
  // Account for payments already made
  const paidPrincipal = loan.paymentsMade.reduce((sum, payment) => sum + payment.principal, 0);
  balance -= paidPrincipal;
  
  // If loan is fully paid off, return empty schedule
  if (balance <= 0) return [];
  
  // Set date to current date or loan start date, whichever is later
  const today = new Date();
  if (date < today) {
    date = today;
  }
  
  while (balance > 0) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = totalMonthlyPayment - interestPayment;
    
    // Adjust final payment if it's more than the remaining balance
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    
    balance -= principalPayment;
    
    schedule.push({
      date: date.toISOString(),
      payment: principalPayment + interestPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: balance
    });
    
    // Move to next month
    date.setMonth(date.getMonth() + 1);
    
    // Safety check to prevent infinite loops
    if (schedule.length > 1200) { // 100 years
      break;
    }
  }
  
  return schedule;
};

/**
 * Calculate loan summary with all key metrics
 */
export const calculateLoanSummary = (loan: Loan, additionalPayment: number = 0): LoanSummary => {
  const schedule = generateAmortizationSchedule(loan, additionalPayment);
  const paidPrincipal = loan.paymentsMade.reduce((sum, payment) => sum + payment.principal, 0);
  const paidInterest = loan.paymentsMade.reduce((sum, payment) => sum + payment.interest, 0);
  
  // Get totals from remaining payments
  const futurePrincipal = schedule.reduce((sum, payment) => sum + payment.principal, 0);
  const futureInterest = schedule.reduce((sum, payment) => sum + payment.interest, 0);
  
  const totalPrincipal = loan.principal;
  const totalInterest = paidInterest + futureInterest;
  const remainingBalance = totalPrincipal - paidPrincipal;
  const progressPercentage = (paidPrincipal / totalPrincipal) * 100;
  
  // Calculate payoff date
  let payoffDate;
  if (schedule.length > 0) {
    payoffDate = new Date(schedule[schedule.length - 1].date).toISOString();
  } else {
    // If there's no schedule (loan is paid off), use the last payment date or today
    const lastPaymentDate = loan.paymentsMade.length > 0 
      ? new Date(loan.paymentsMade[loan.paymentsMade.length - 1].date)
      : new Date();
    payoffDate = lastPaymentDate.toISOString();
  }
  
  return {
    totalPrincipal,
    totalInterest,
    totalPayments: totalPrincipal + totalInterest,
    payoffDate,
    monthlyPayment: loan.minimumPayment + additionalPayment,
    remainingBalance,
    progressPercentage
  };
};

/**
 * Simulate loan repayment using either avalanche or snowball method
 */
export const simulateRepaymentStrategy = (
  loans: Loan[], 
  method: RepaymentMethod,
  additionalPayment: number = 0
): RepaymentStrategy => {
  // Clone loans to avoid modifying originals
  let loansCopy = JSON.parse(JSON.stringify(loans)) as Loan[];
  
  // Sort loans according to strategy
  if (method === 'avalanche') {
    // Sort by interest rate (highest first)
    loansCopy.sort((a, b) => b.interestRate - a.interestRate);
  } else {
    // Sort by remaining balance (lowest first)
    loansCopy.sort((a, b) => {
      const balanceA = a.principal - a.paymentsMade.reduce((sum, p) => sum + p.principal, 0);
      const balanceB = b.principal - b.paymentsMade.reduce((sum, p) => sum + p.principal, 0);
      return balanceA - balanceB;
    });
  }
  
  // Track payoff order
  const payoffOrder: string[] = [];
  
  // Calculate minimum payment for all loans
  let totalMinPayment = loansCopy.reduce((sum, loan) => sum + loan.minimumPayment, 0);
  let extraPayment = additionalPayment;
  
  // Track total interest paid
  let totalInterestPaid = 0;
  
  // Track latest payoff date
  let latestPayoffDate = new Date();
  
  // Continue until all loans are paid off
  while (loansCopy.length > 0) {
    // Apply minimum payment to all loans
    loansCopy = loansCopy.filter(loan => {
      const balance = loan.principal - loan.paymentsMade.reduce((sum, p) => sum + p.principal, 0);
      if (balance <= 0) return false;
      
      const monthlyRate = loan.interestRate / 100 / 12;
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(loan.minimumPayment - interestPayment, balance);
      
      loan.paymentsMade.push({
        id: Math.random().toString(36).substring(2),
        date: new Date().toISOString(),
        amount: loan.minimumPayment,
        principal: principalPayment,
        interest: interestPayment
      });
      
      totalInterestPaid += interestPayment;
      
      // Check if loan is now paid off
      const newBalance = balance - principalPayment;
      if (newBalance <= 0) {
        payoffOrder.push(loan.name);
        
        // Add this loan's minimum payment to extra payment for next round
        extraPayment += loan.minimumPayment;
        
        // Update latest payoff date
        latestPayoffDate = new Date();
        
        return false;
      }
      
      return true;
    });
    
    // Apply extra payment to first loan
    if (loansCopy.length > 0 && extraPayment > 0) {
      const targetLoan = loansCopy[0];
      const balance = targetLoan.principal - targetLoan.paymentsMade.reduce((sum, p) => sum + p.principal, 0);
      const monthlyRate = targetLoan.interestRate / 100 / 12;
      
      // Calculate how much interest would be paid on the balance
      const interestPayment = balance * monthlyRate;
      
      // Apply extra payment to principal
      const principalPayment = Math.min(extraPayment, balance);
      
      if (principalPayment > 0) {
        targetLoan.paymentsMade.push({
          id: Math.random().toString(36).substring(2),
          date: new Date().toISOString(),
          amount: principalPayment,
          principal: principalPayment,
          interest: 0 // Extra payments typically don't include interest
        });
        
        // Check if loan is now paid off
        const newBalance = balance - principalPayment;
        if (newBalance <= 0) {
          payoffOrder.push(targetLoan.name);
          
          // Add this loan's minimum payment to extra payment for next round
          extraPayment += targetLoan.minimumPayment;
          
          // Remove the paid off loan
          loansCopy.shift();
          
          // Update latest payoff date
          latestPayoffDate = new Date();
        }
      }
    }
    
    // Move date forward one month
    latestPayoffDate.setMonth(latestPayoffDate.getMonth() + 1);
    
    // Safety check to prevent infinite loops
    if (totalInterestPaid > 1000000000) { // $1 billion cap
      break;
    }
  }
  
  return {
    name: method === 'avalanche' ? 'Avalanche Method' : 'Snowball Method',
    description: method === 'avalanche' 
      ? 'Pays off loans with highest interest rate first'
      : 'Pays off loans with lowest balance first',
    totalInterestPaid,
    payoffDate: latestPayoffDate.toISOString(),
    loanPayoffOrder: payoffOrder
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};
