import type { AssessmentInput } from './riskEngine';

export const STORAGE_KEY = 'defynix.customBorrowers';

export interface StoredBorrower extends AssessmentInput {
  id: string;
}

export function loadCustomBorrowers(): StoredBorrower[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredBorrower[];
  } catch {
    return [];
  }
}

export function saveCustomBorrowers(borrowers: StoredBorrower[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(borrowers));
}

export function addCustomBorrower(borrower: StoredBorrower) {
  const items = loadCustomBorrowers();
  saveCustomBorrowers([borrower, ...items]);
}

export function removeCustomBorrower(id: string) {
  const items = loadCustomBorrowers();
  saveCustomBorrowers(items.filter(item => item.id !== id));
}
