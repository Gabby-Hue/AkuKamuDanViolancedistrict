"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationActions } from "./application-actions";
import { useRouter } from "next/navigation";
import type { VenuePartnerApplication } from "@/lib/queries";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ApplicationsClientProps {
  allApplications: VenuePartnerApplication[];
  pendingApplications: VenuePartnerApplication[];
  acceptedApplications: VenuePartnerApplication[];
  rejectedApplications: VenuePartnerApplication[];
}

export function ApplicationsClient({
  allApplications,
  pendingApplications,
  acceptedApplications,
  rejectedApplications,
}: ApplicationsClientProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(allApplications);

  const refreshData = () => {
    router.refresh();
  };

  const [itemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = allApplications.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allApplications.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingApplications.length}
            </div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {acceptedApplications.length}
            </div>
            <p className="text-xs text-muted-foreground">Approved venues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rejectedApplications.length}
            </div>
            <p className="text-xs text-muted-foreground">Rejected venues</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Management</CardTitle>
          <CardDescription>
            Review and manage venue partnership applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({acceptedApplications.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedApplications.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Applications ({allApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onActionComplete={refreshData}
                    />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acceptedApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onActionComplete={refreshData}
                      showReviewedDate={true}
                    />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Rejected Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onActionComplete={refreshData}
                      showReviewedDate={true}
                    />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onActionComplete={refreshData}
                    />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, allApplications.length)}{" "}
                  of {allApplications.length} applications
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        onClick={() =>
                          currentPage > 1 && setCurrentPage(currentPage - 1)
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">{currentPage}</PaginationLink>
                    </PaginationItem>
                    {totalPages > 1 && (
                      <PaginationItem>
                        <PaginationLink href="#">
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    {totalPages > 2 && <PaginationEllipsis />}
                    <PaginationItem>
                      <PaginationLink href="#">{totalPages}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        onClick={() =>
                          currentPage < totalPages &&
                          setCurrentPage(currentPage + 1)
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ApplicationRow component for reusability
function ApplicationRow({
  application,
  onActionComplete,
  showReviewedDate = false,
}: {
  application: VenuePartnerApplication;
  onActionComplete?: () => void;
  showReviewedDate?: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {application.id.substring(0, 8)}...
      </TableCell>
      <TableCell>{application.organizationName || "N/A"}</TableCell>
      <TableCell>{application.contactName}</TableCell>
      <TableCell>{application.contactEmail}</TableCell>
      <TableCell>{application.city}</TableCell>
      <TableCell>
        {format(new Date(application.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
      </TableCell>
      {showReviewedDate && (
        <TableCell>
          {application.reviewedAt
            ? format(new Date(application.reviewedAt), "dd MMM yyyy, HH:mm", { locale: id })
            : "-"
          }
        </TableCell>
      )}
      <TableCell>
        <Badge
          variant={
            application.status === "accepted"
              ? "default"
              : application.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{application.organizationName || application.contactName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Application ID</Label>
                    <p className="text-sm font-medium">{application.id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge
                      variant={
                        application.status === "accepted"
                          ? "default"
                          : application.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Contact Information</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <strong>Organization:</strong> {application.organizationName || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Contact Person:</strong> {application.contactName}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {application.contactEmail}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> {application.contactPhone}
                    </p>
                    <p className="text-sm">
                      <strong>City:</strong> {application.city}
                    </p>
                  </div>
                </div>

                {application.notes && (
                  <div>
                    <Label>Additional Notes</Label>
                    <p className="text-sm mt-2">{application.notes}</p>
                  </div>
                )}

                <div>
                  <Label>Application Information</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <strong>Applied Date:</strong>{" "}
                      {format(new Date(application.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </p>
                    {application.reviewedAt && (
                      <p className="text-sm">
                        <strong>Reviewed Date:</strong>{" "}
                        {format(new Date(application.reviewedAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </p>
                    )}
                    {application.handledBy && (
                      <p className="text-sm">
                        <strong>Handled By:</strong> {application.handledBy}
                      </p>
                    )}
                  </div>
                </div>

                {application.status === "pending" && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reason = prompt(
                          "Reason for rejection (optional):",
                        );
                        if (reason !== null) {
                          // Handle rejection
                        }
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {application.status === "pending" && (
            <ApplicationActions
              applicationId={application.id}
              onActionComplete={onActionComplete}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
