export interface ImportJob {
  id: string;
  enabled: boolean;
  auditboardType: string;
  tenableType: string;
  frequency: string;
  status: string;
  lastImport: string;
  nextImport: string;
  createdAt: string;
}

class ImportJobStore {
  private jobs: ImportJob[] = [];
  private listeners: Set<() => void> = new Set();

  addJob(job: ImportJob) {
    this.jobs.push(job);
    this.notifyListeners();
  }

  getJobs(): ImportJob[] {
    return [...this.jobs];
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export const importJobStore = new ImportJobStore();
