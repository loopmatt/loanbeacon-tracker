
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, BarChart3, LineChart, ArrowLeftRight } from "lucide-react";
import { Loan, Payment } from "../models/loanTypes";
import { Dashboard } from "../components/Dashboard";
import { LoanForm } from "../components/LoanForm";
import { LoanList } from "../components/LoanList";
import { PaymentVisualization } from "../components/PaymentVisualization";
import { StrategyComparison } from "../components/StrategyComparison";
import { ExtraPaymentSimulator } from "../components/ExtraPaymentSimulator";
import { loadLoans, saveLoans } from "../services/storageService";
import { calculateMonthlyPayment } from "../utils/loanCalculations";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [additionalPayment, setAdditionalPayment] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  useEffect(() => {
    // Load loans from local storage on initial render
    const storedLoans = loadLoans();
    setLoans(storedLoans);
    
    // Show welcome toast if no loans found
    if (storedLoans.length === 0) {
      setTimeout(() => {
        toast({
          title: "Welcome to Student Loan Tracker",
          description: "Add your first loan to get started tracking your student loans.",
        });
      }, 1000);
    }
  }, []);
  
  useEffect(() => {
    // Save loans to local storage whenever they change
    saveLoans(loans);
  }, [loans]);
  
  const handleAddLoan = (loan: Loan) => {
    setLoans([...loans, loan]);
    
    // Auto-switch to dashboard after adding first loan
    if (loans.length === 0) {
      setTimeout(() => setActiveTab("dashboard"), 500);
    }
  };
  
  const handleDeleteLoan = (id: string) => {
    setLoans(loans.filter(loan => loan.id !== id));
    
    toast({
      title: "Loan deleted",
      description: "The loan has been removed from your tracker.",
    });
  };
  
  const handleAddPayment = (loanId: string, amount: number) => {
    setLoans(loans.map(loan => {
      if (loan.id === loanId) {
        // Calculate interest for this payment
        const paidPrincipal = loan.paymentsMade.reduce((sum, payment) => sum + payment.principal, 0);
        const remainingPrincipal = loan.principal - paidPrincipal;
        const monthlyRate = loan.interestRate / 100 / 12;
        const interest = remainingPrincipal * monthlyRate;
        
        // Calculate principal portion (remaining amount goes to principal)
        const principal = Math.min(amount - interest, remainingPrincipal);
        
        // Create new payment
        const newPayment: Payment = {
          id: Math.random().toString(36).substring(2),
          date: new Date().toISOString(),
          amount,
          principal,
          interest: amount - principal
        };
        
        // Add payment to loan
        return {
          ...loan,
          paymentsMade: [...loan.paymentsMade, newPayment]
        };
      }
      return loan;
    }));
  };
  
  const handleAdditionalPaymentChange = (amount: number) => {
    setAdditionalPayment(amount);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background animate-fadeIn">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-10 bg-white/80">
        <div className="container max-w-6xl mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LineChart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Student Loan Tracker</h1>
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1"
              onClick={() => setActiveTab("add-loan")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Loan</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container max-w-6xl mx-auto py-6 px-4">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-8 border-b border-border">
            <TabsList className="bg-transparent w-full justify-start pb-1 gap-4">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="loans" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                <FileText className="h-4 w-4 mr-2" />
                My Loans
              </TabsTrigger>
              <TabsTrigger 
                value="visualization" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Visualizations
              </TabsTrigger>
              <TabsTrigger 
                value="strategies" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Strategies
              </TabsTrigger>
              <TabsTrigger 
                value="add-loan" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Loan
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="space-y-8">
            <TabsContent value="dashboard" className="mt-0">
              {loans.length > 0 ? (
                <Dashboard loans={loans} additionalPayment={additionalPayment} />
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-4">Welcome to Your Loan Tracker</h2>
                  <p className="text-muted-foreground mb-8">Start by adding your first loan to see your dashboard</p>
                  <Button 
                    onClick={() => setActiveTab("add-loan")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Loan
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="loans" className="mt-0">
              <LoanList
                loans={loans}
                onDeleteLoan={handleDeleteLoan}
                onAddPayment={handleAddPayment}
              />
            </TabsContent>
            
            <TabsContent value="visualization" className="mt-0">
              {loans.length > 0 ? (
                <div className="space-y-12">
                  <PaymentVisualization loans={loans} additionalPayment={additionalPayment} />
                  <ExtraPaymentSimulator
                    loans={loans}
                    additionalPayment={additionalPayment}
                    onAdditionalPaymentChange={handleAdditionalPaymentChange}
                  />
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-4">No Loans to Visualize</h2>
                  <p className="text-muted-foreground mb-8">Add your first loan to see payment visualizations</p>
                  <Button 
                    onClick={() => setActiveTab("add-loan")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Loan
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="strategies" className="mt-0">
              {loans.length > 1 ? (
                <StrategyComparison loans={loans} additionalPayment={additionalPayment} />
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-4">Need More Loans for Comparison</h2>
                  <p className="text-muted-foreground mb-8">
                    Add at least two loans to compare repayment strategies
                  </p>
                  <Button 
                    onClick={() => setActiveTab("add-loan")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Loan
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add-loan" className="mt-0">
              <div className="max-w-xl mx-auto">
                <LoanForm onAddLoan={handleAddLoan} />
                
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">How to Use the Loan Tracker</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Add all your student loans with their details</li>
                    <li>View your loans and their progress on the dashboard</li>
                    <li>Record payments as you make them</li>
                    <li>Compare repayment strategies to find the optimal approach</li>
                    <li>Simulate how extra payments can impact your payoff timeline</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
      
      <footer className="border-t border-border/40 py-6 mt-8 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Student Loan Tracker — Your data is stored locally in your browser</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
