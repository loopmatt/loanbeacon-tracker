
import { Loan } from "../models/loanTypes";

const STORAGE_KEY = 'studentLoanTracker';

/**
 * Save loans data to local storage
 */
export const saveLoans = (loans: Loan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  } catch (error) {
    console.error('Error saving loans to local storage:', error);
  }
};

/**
 * Load loans data from local storage
 */
export const loadLoans = (): Loan[] => {
  try {
    const storedLoans = localStorage.getItem(STORAGE_KEY);
    return storedLoans ? JSON.parse(storedLoans) : [];
  } catch (error) {
    console.error('Error loading loans from local storage:', error);
    return [];
  }
};

/**
 * Clear all loans data from local storage
 */
export const clearLoans = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing loans from local storage:', error);
  }
};

/**
 * Export loans data as JSON file
 */
export const exportLoans = (loans: Loan[]): void => {
  try {
    const dataStr = JSON.stringify(loans, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `student-loans-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting loans:', error);
  }
};

/**
 * Import loans data from JSON file
 * @returns A promise that resolves to the imported loans array
 */
export const importLoans = (): Promise<Loan[]> => {
  return new Promise((resolve, reject) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      
      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
          reject(new Error('No file selected'));
          return;
        }
        
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const result = e.target?.result as string;
            const importedLoans = JSON.parse(result) as Loan[];
            resolve(importedLoans);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      reject(error);
    }
  });
};
