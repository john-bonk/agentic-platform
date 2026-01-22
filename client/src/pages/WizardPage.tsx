import { useState, useRef, useCallback } from "react";
import { X, Upload, PlusCircle, ArrowDownToLine, FileText, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wizard,
  WizardHeader,
  WizardContent,
  WizardFooter,
  useWizard,
} from "@/components/ui/wizard";
import { useTabStore } from "@/lib/tabStore";
import { useToast } from "@/hooks/use-toast";

interface WizardFormData {
  itemName: string;
  itemOwner: string;
  creationMode: "new" | "import" | null;
  uploadedFile: File | null;
  description: string;
  category: string;
  priority: string;
  effectiveDate: string;
  reviewers: { id: string; name: string; role: string }[];
}

const defaultFormData: WizardFormData = {
  itemName: "",
  itemOwner: "",
  creationMode: null,
  uploadedFile: null,
  description: "",
  category: "",
  priority: "",
  effectiveDate: "",
  reviewers: [
    { id: "1", name: "Aaron Clark", role: "Manager" },
    { id: "2", name: "Sarah Johnson", role: "Analyst" },
    { id: "3", name: "Mike Williams", role: "Director" },
  ],
};

interface StepProps {
  formData: WizardFormData;
  setFormData: (data: WizardFormData) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    txt: 'Text',
    csv: 'CSV',
  };
  return typeMap[ext] || ext.toUpperCase();
}

function Step1Content({ formData, setFormData }: StepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFormData({ ...formData, uploadedFile: files[0] });
    }
  }, [formData, setFormData]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData({ ...formData, uploadedFile: files[0] });
    }
  }, [formData, setFormData]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, uploadedFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 max-w-[700px]">
      <div className="space-y-1">
        <Label htmlFor="item-name" className="text-sm font-medium text-slate-900 dark:text-foreground">Item Name</Label>
        <Input
          id="item-name"
          className="h-8 text-[13px]"
          value={formData.itemName}
          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
          data-testid="input-item-name"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="item-owner" className="text-sm font-medium text-slate-900 dark:text-foreground">Owner</Label>
        <Select
          value={formData.itemOwner}
          onValueChange={(value) => setFormData({ ...formData, itemOwner: value })}
        >
          <SelectTrigger id="item-owner" className="h-8 text-[13px]" data-testid="select-item-owner">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user1">John Smith</SelectItem>
            <SelectItem value="user2">Jane Doe</SelectItem>
            <SelectItem value="user3">Bob Johnson</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          className={`bg-white dark:bg-card border rounded p-4 cursor-pointer hover-elevate transition-colors h-[113px] ${
            formData.creationMode === "new"
              ? "border-[#266C92]"
              : "border-slate-200 dark:border-border"
          }`}
          onClick={() => setFormData({ ...formData, creationMode: "new", uploadedFile: null })}
          data-testid="option-create-new"
        >
          <div className="flex flex-col items-center text-center gap-1.5 h-full justify-center">
            <PlusCircle className="w-3 h-3 text-slate-500 dark:text-muted-foreground" />
            <p className="text-sm text-slate-900 dark:text-foreground">Create New Item</p>
            <p className="text-xs text-slate-500/70 dark:text-muted-foreground leading-relaxed">
              Manually provide information and content for your new item.
            </p>
          </div>
        </button>
        <button
          type="button"
          className={`bg-white dark:bg-card border rounded p-4 cursor-pointer hover-elevate transition-colors h-[113px] ${
            formData.creationMode === "import"
              ? "border-[#266C92]"
              : "border-slate-200 dark:border-border"
          }`}
          onClick={() => setFormData({ ...formData, creationMode: "import" })}
          data-testid="option-import"
        >
          <div className="flex flex-col items-center text-center gap-1.5 h-full justify-center">
            <ArrowDownToLine className="w-3 h-3 text-slate-500 dark:text-muted-foreground" />
            <p className="text-sm text-slate-900 dark:text-foreground">Import Existing Item</p>
            <p className="text-xs text-slate-500/70 dark:text-muted-foreground leading-relaxed">
              Upload an existing document to import into the system.
            </p>
          </div>
        </button>
      </div>
      {formData.creationMode === "import" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            data-testid="input-file"
          />
          {formData.uploadedFile ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900 dark:text-foreground">Upload Document</Label>
              <div className="bg-[#266C92]/5 dark:bg-[#266C92]/10 border border-[#266C92]/20 rounded p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-card border border-slate-200 dark:border-border rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-slate-400 dark:text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-foreground truncate">{formData.uploadedFile.name}</p>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground">
                    {getFileType(formData.uploadedFile.name)} - {formatFileSize(formData.uploadedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-muted-foreground dark:hover:text-foreground transition-colors"
                  data-testid="button-remove-file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">
                Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
              </p>
            </div>
          ) : (
            <div
              className={`bg-slate-50 dark:bg-muted border border-dashed rounded p-4 transition-colors ${
                isDragging ? "border-[#266C92] bg-[#266C92]/5 dark:bg-[#266C92]/10" : "border-slate-300 dark:border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="drop-zone"
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-muted-foreground" />
                <span className="text-xs text-slate-900 dark:text-foreground">Drag and drop file or</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-[30px] text-xs px-2.5"
                  onClick={handleBrowseClick}
                  data-testid="button-browse"
                >
                  Browse Files
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Step2Content({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-background text-foreground"
          placeholder="Enter a description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger id="category" data-testid="select-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category1">Category 1</SelectItem>
              <SelectItem value="category2">Category 2</SelectItem>
              <SelectItem value="category3">Category 3</SelectItem>
              <SelectItem value="category4">Category 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger id="priority" data-testid="select-priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="effective-date">Effective Date</Label>
        <Input
          id="effective-date"
          type="date"
          value={formData.effectiveDate}
          onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
          data-testid="input-effective-date"
        />
      </div>
    </div>
  );
}

function Step3Content({ formData, setFormData }: StepProps) {
  const availableReviewers = [
    { id: "4", name: "Emily Davis", role: "Reviewer" },
    { id: "5", name: "Robert Brown", role: "Approver" },
    { id: "6", name: "Lisa Anderson", role: "Admin" },
  ];

  const handleAddReviewer = (reviewerId: string) => {
    const reviewer = availableReviewers.find((r) => r.id === reviewerId);
    if (reviewer && !formData.reviewers.find((r) => r.id === reviewer.id)) {
      setFormData({
        ...formData,
        reviewers: [...formData.reviewers, reviewer],
      });
    }
  };

  const handleRemoveReviewer = (reviewerId: string) => {
    setFormData({
      ...formData,
      reviewers: formData.reviewers.filter((r) => r.id !== reviewerId),
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>Add Reviewers</Label>
        <Select onValueChange={handleAddReviewer}>
          <SelectTrigger data-testid="select-add-reviewer">
            <SelectValue placeholder="Search for reviewers..." />
          </SelectTrigger>
          <SelectContent>
            {availableReviewers
              .filter((r) => !formData.reviewers.find((fr) => fr.id === r.id))
              .map((reviewer) => (
                <SelectItem key={reviewer.id} value={reviewer.id}>
                  {reviewer.name} - {reviewer.role}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Selected Reviewers ({formData.reviewers.length})</Label>
        <div className="space-y-2">
          {formData.reviewers.map((reviewer) => (
            <div
              key={reviewer.id}
              className="flex items-center justify-between p-3 border border-slate-200 dark:border-border rounded-md bg-white dark:bg-card"
              data-testid={`reviewer-item-${reviewer.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium">
                  {reviewer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{reviewer.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {reviewer.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveReviewer(reviewer.id)}
                data-testid={`button-remove-reviewer-${reviewer.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {formData.reviewers.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No reviewers selected. Add reviewers from the dropdown above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WizardStepContent({ formData, setFormData }: StepProps) {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case 0:
      return <Step1Content formData={formData} setFormData={setFormData} />;
    case 1:
      return <Step2Content formData={formData} setFormData={setFormData} />;
    case 2:
      return <Step3Content formData={formData} setFormData={setFormData} />;
    default:
      return <Step1Content formData={formData} setFormData={setFormData} />;
  }
}

export default function WizardPage() {
  const [location, setLocation] = useLocation();
  const { closeTab } = useTabStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData);

  const isTemplate2 = location.startsWith("/template2");
  const basePath = isTemplate2 ? "/template2" : "";

  const handleClose = () => {
    closeTab("wizard");
    setLocation(basePath || "/");
  };

  const handleFinish = () => {
    const itemName = formData.itemName || 'New Item';
    toast({
      title: "Item Created Successfully",
      description: `"${itemName}" has been created with ${formData.reviewers.length} reviewer${formData.reviewers.length !== 1 ? 's' : ''}.`,
    });
    closeTab("wizard");
    setLocation(basePath || "/");
  };

  return (
    <AppLayout
      activeTab={{
        id: "wizard",
        name: "Create New Item",
        path: `${basePath}/wizard`
      }}
    >
      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-card">
        <Wizard
          steps={[
            { id: "details", label: "Item Details" },
            { id: "data", label: "Item Data" },
            { id: "reviewers", label: "Select Reviewers" },
          ]}
          defaultStep={0}
        >
          <WizardHeader title="Create New Item">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              data-testid="button-close-wizard"
            >
              <X className="w-4 h-4" />
            </Button>
          </WizardHeader>
          <WizardContent className="flex-1 overflow-auto py-6 px-8">
            <WizardStepContent formData={formData} setFormData={setFormData} />
          </WizardContent>
          <WizardFooter
            showTertiaryButton={false}
            secondaryLabel="Cancel"
            nextLabel="Next"
            finishLabel="Create Item"
            onSecondary={handleClose}
            onFinish={handleFinish}
          />
        </Wizard>
      </div>
    </AppLayout>
  );
}
