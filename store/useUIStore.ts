import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isViewerOpen: boolean;
  viewerPolicyId: string | null;
  isAckModalOpen: boolean;
  ackModalPolicyId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openViewer: (policyId: string) => void;
  closeViewer: () => void;
  openAckModal: (policyId: string) => void;
  closeAckModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isViewerOpen: false,
  viewerPolicyId: null,
  isAckModalOpen: false,
  ackModalPolicyId: null,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openViewer: (policyId) => set({ isViewerOpen: true, viewerPolicyId: policyId }),
  closeViewer: () => set({ isViewerOpen: false, viewerPolicyId: null }),
  openAckModal: (policyId) => set({ isAckModalOpen: true, ackModalPolicyId: policyId }),
  closeAckModal: () => set({ isAckModalOpen: false, ackModalPolicyId: null }),
}));
