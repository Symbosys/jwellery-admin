import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  CalendarDays,
} from "lucide-react";
import { useUsersQuery } from "@/api/hooks/user.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch users with filters
  const { data, isLoading, isError, error } = useUsersQuery({
    page: currentPage,
    limit,
    search: searchQuery || undefined,
  });

  const users = data?.users || [];
  const pagination = data?.pagination;
  const totalUsers = data?.totalUsers || 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage and view registration details of your customers
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-sm font-semibold self-start sm:self-auto">
          <UserCheck className="w-4 h-4" />
          <span>{totalUsers} Registered Customers</span>
        </div>
      </motion.div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card border border-border rounded-xl p-4 shadow-soft">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone number..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-soft">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground mt-2">
            Loading customer list...
          </p>
        </div>
      ) : isError ? (
        <div className="bg-card border border-destructive/20 rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 text-destructive opacity-80" />
          <p className="font-semibold text-lg text-foreground">
            Failed to load customers
          </p>
          <p className="text-sm mt-1 text-destructive/80">
            {(error as any)?.message || "An unexpected error occurred."}
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-lg text-foreground">
            No customers found
          </p>
          <p className="text-sm mt-1">
            Try refining your search query or registering new users.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead className="text-right">Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const initials =
                    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
                    "U";
                  const fullName =
                    user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "Unnamed Customer";

                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">
                              {fullName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono block truncate max-w-[150px]">
                              {user.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-sm text-foreground">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No Email
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.gender ? (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-sm",
                              user.gender === "MALE" &&
                                "bg-sky-500/10 text-sky-500 border-sky-500/20",
                              user.gender === "FEMALE" &&
                                "bg-pink-500/10 text-pink-500 border-pink-500/20",
                              user.gender === "OTHER" &&
                                "bg-purple-500/10 text-purple-500 border-purple-500/20",
                            )}
                          >
                            {user.gender}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Not Specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.dateOfBirth ? (
                          <div className="flex items-center gap-1.5 text-sm text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>
                              {new Date(user.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Not Specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-sm text-foreground">
                          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPage > 1 && (
            <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                Page{" "}
                <span className="font-semibold text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {pagination.totalPage}
                </span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-8 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPage}
                  className="h-8 gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
