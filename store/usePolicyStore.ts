import { create } from 'zustand';
import type { PolicyWithStatus, PolicyCategory } from '@/types/index';

type StatusFilter = 'all' | 'pending' | 'acknowledged';

interface PolicyState {
  policies: PolicyWithStatus[];
  selectedCategory: PolicyCategory | 'All';
  searchQuery: string;
  filter: StatusFilter;
  setPolicies: (policies: PolicyWithStatus[]) => void;
  setSelectedCategory: (category: PolicyCategory | 'All') => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: StatusFilter) => void;
  getFilteredPolicies: () => PolicyWithStatus[];
}

export const usePolicyStore = create<PolicyState>((set, get) => ({
  policies: [],
  selectedCategory: 'All',
  searchQuery: '',
  filter: 'all',
  setPolicies: (policies) => set({ policies }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (filter) => set({ filter }),
  getFilteredPolicies: () => {
    const { policies, selectedCategory, searchQuery, filter } = get();
    return policies.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'acknowledged' && p.is_acknowledged) ||
        (filter === 'pending' && !p.is_acknowledged);
      return matchesCategory && matchesSearch && matchesFilter;
    });
  },
}));
