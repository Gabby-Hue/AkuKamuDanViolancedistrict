"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { approveApplication, rejectApplication } from "@/app/venue-partner/actions";

interface ApplicationActionsProps {
  applicationId: string;
  onActionComplete?: () => void;
}

export function ApplicationActions({ applicationId, onActionComplete }: ApplicationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result = await approveApplication(applicationId);
      if (result.success) {
        onActionComplete?.();
      } else {
        alert(`Failed to approve application: ${result.message}`);
      }
    } catch (error) {
      alert(`Error approving application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    setIsLoading(true);
    try {
      const result = await rejectApplication(applicationId, reason);
      if (result.success) {
        onActionComplete?.();
      } else {
        alert(`Failed to reject application: ${result.message}`);
      }
    } catch (error) {
      alert(`Error rejecting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        size="icon"
        className="h-8 w-8 bg-green-600 hover:bg-green-700"
        onClick={handleApprove}
        disabled={isLoading}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        className="h-8 w-8"
        onClick={handleReject}
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}