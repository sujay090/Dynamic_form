import { useState, useEffect } from 'react';

interface Branch {
  _id: string;
  branchName: string;
  code: string;
  address: string;
  phone: string;
}

export const useBranchSelection = () => {
  // For now, using a default branch - you can update this to get from API or user selection
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>({
    _id: 'default-branch-id',
    branchName: 'Main Branch',
    code: 'MAIN',
    address: 'Main Address',
    phone: '1234567890'
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // You can add API call here to load branches
  useEffect(() => {
    // loadBranches();
  }, []);

  const loadBranches = async () => {
    // API call to load branches
    setIsLoading(true);
    try {
      // const response = await api.get('/branches');
      // setBranches(response.data.data);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedBranch,
    setSelectedBranch,
    branches,
    setBranches,
    isLoading,
    loadBranches
  };
};