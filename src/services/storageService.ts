
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
