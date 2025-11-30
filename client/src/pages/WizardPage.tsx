import { useState } from "react";
import { X, Upload, FilePlus, FileUp } from "lucide-react";
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

interface WizardFormData {
  itemName: string;
  itemOwner: string;
  creationMode: "new" | "import" | null;
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

function Step1Content({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="item-name">Item Name</Label>
        <Input
          id="item-name"
          placeholder="Enter item name"
          value={formData.itemName}
          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
          data-testid="input-item-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="item-owner">Owner</Label>
        <Select
          value={formData.itemOwner}
          onValueChange={(value) => setFormData({ ...formData, itemOwner: value })}
        >
          <SelectTrigger id="item-owner" data-testid="select-item-owner">
            <SelectValue placeholder="Select an owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user1">John Smith</SelectItem>
            <SelectItem value="user2">Jane Doe</SelectItem>
            <SelectItem value="user3">Bob Johnson</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div
          className={`border rounded-md p-4 cursor-pointer hover-elevate transition-colors ${
            formData.creationMode === "new"
              ? "border-[#266C92] bg-[#266C92]/5"
              : ""
          }`}
          onClick={() => setFormData({ ...formData, creationMode: "new" })}
          data-testid="option-create-new"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center ${
                formData.creationMode === "new"
                  ? "bg-[#266C92]/10"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <FilePlus
                className={`w-5 h-5 ${
                  formData.creationMode === "new" ? "text-[#266C92]" : "text-slate-500"
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-sm">Create New</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manually provide information and content for your new item.
              </p>
            </div>
          </div>
        </div>
        <div
          className={`border rounded-md p-4 cursor-pointer hover-elevate transition-colors ${
            formData.creationMode === "import"
              ? "border-[#266C92] bg-[#266C92]/5"
              : ""
          }`}
          onClick={() => setFormData({ ...formData, creationMode: "import" })}
          data-testid="option-import"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center ${
                formData.creationMode === "import"
                  ? "bg-[#266C92]/10"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <FileUp
                className={`w-5 h-5 ${
                  formData.creationMode === "import" ? "text-[#266C92]" : "text-slate-500"
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-sm">Import Existing</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload an existing document to import into the system.
              </p>
            </div>
          </div>
        </div>
      </div>
      {formData.creationMode === "import" && (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-md p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag and drop file or{" "}
              <Button variant="link" className="p-0 h-auto" data-testid="button-browse">
                Browse Files
              </Button>
            </p>
          </div>
        </div>
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
              className="flex items-center justify-between p-3 border rounded-md"
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
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData);

  const isTemplate2 = location.startsWith("/template2");
  const basePath = isTemplate2 ? "/template2" : "";

  const handleClose = () => {
    closeTab("wizard");
    setLocation(basePath || "/");
  };

  const handleFinish = () => {
    alert(`Item "${formData.itemName || 'New Item'}" created successfully with ${formData.reviewers.length} reviewers!`);
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
      <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
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
