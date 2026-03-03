import React, { createContext, useContext, useState, useEffect } from 'react';
import { BranchResponse } from '../types/cooking';
import { branchApi } from '../services/cookingApi';

interface BranchContextType {
  branches: BranchResponse[];
  selectedBranch: BranchResponse | null;
  selectBranch: (branch: BranchResponse) => void;
  loadBranches: () => Promise<void>;
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      console.log('Loading branches...');
      const response = await branchApi.getAll({ page: 1, limit: 100 });
      console.log('Branch API response:', response);
      
      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        const branchList = Array.isArray(response.data) 
          ? response.data 
          : response.data.items;
        
        console.log('Branch list:', branchList);
        setBranches(branchList);
        
        // Auto-select from localStorage or first branch
        const savedBranchId = localStorage.getItem('selectedBranchId');
        if (savedBranchId) {
          const saved = branchList.find(b => b.id === savedBranchId);
          if (saved) {
            console.log('Selected saved branch:', saved);
            setSelectedBranch(saved);
            return;
          }
        }
        
        // Select first branch by default
        if (branchList.length > 0) {
          console.log('Selected first branch:', branchList[0]);
          setSelectedBranch(branchList[0]);
          localStorage.setItem('selectedBranchId', branchList[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectBranch = (branch: BranchResponse) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranchId', branch.id);
  };

  useEffect(() => {
    loadBranches();
  }, []);

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, selectBranch, loadBranches, isLoading }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
};
