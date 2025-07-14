import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ResourceApprovalActionsProps {
  resourceId: string;
  approvalStatus: boolean;
}

export const ResourceApprovalActions: React.FC<ResourceApprovalActionsProps> = ({ resourceId, approvalStatus }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  const handleApprovalChange = async (approve: boolean) => {
    try {
      if (approve) {
        setIsApproving(true);
      } else {
        setIsRejecting(true);
      }

      const response = await fetch(`https://api.thegpdn.org/api/admin/approveORdeclineResource`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId,
          actionStatus: approve,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to ${approve ? 'approve' : 'reject'} resource.`);
      }

      toast({
        title: approve ? "Resource approved" : "Resource rejected",
        description: `The resource has been successfully ${approve ? 'approved' : 'rejected'}.`,
        variant: "default",
      });
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage || `Failed to ${approve ? 'approve' : 'reject'} the resource. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={approvalStatus ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
      >
        {approvalStatus ? "Approved" : "Pending"}
      </Badge>
      {approvalStatus ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleApprovalChange(false)}
          disabled={isRejecting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Revoke Approval"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleApprovalChange(true)}
            disabled={isApproving}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Approve Resource"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleApprovalChange(false)}
            disabled={isRejecting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Reject Resource"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
