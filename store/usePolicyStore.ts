import { create } from 'zustand';
import type { PolicyWithStatus, PolicyCategory } from '@/types/index';

interface PolicyState {
  policies: PolicyWithStatus[];
  selectedCategory: PolicyCategory | 'All';
  searchQuery: string;
  setPolicies: (policies: PolicyWithStatus[]) => void;
  setSelectedCategory: (category: PolicyCategory | 'All') => void;
  setSearchQuery: (query: string) => void;
  getFilteredPolicies: () => PolicyWithStatus[];
}

export const usePolicyStore = create<PolicyState>((set, get) => ({
  policies: [],
  selectedCategory: 'All',
  searchQuery: '',
  setPolicies: (policies) => set({ policies }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  getFilteredPolicies: () => {
    const { policies, selectedCategory, searchQuery } = get();
    return policies.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  },
}));
