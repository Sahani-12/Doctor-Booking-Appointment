import { useState, useEffect } from "react";
import {
  Trash2,
  Loader,
  AlertCircle,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import UserDetailsModal from "../components/Modals/UserDetailsModal";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "../components/Table/AdminTable";

interface User {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  age?: number;
  city?: string;
  isVerified?: boolean;
  createdAt: string;
  role?: string;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleting, setDeleting] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verifying, setVerifying] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "unverified"
  >("all");

  useEffect(() => {
    console.log("👥 UsersPage: Initial load");
    fetchUsers();
  }, [token]);

  // ✅ Update filtered users when search or filter changes (with debounce)
  useEffect(() => {
    let filtered = users.filter(
      (u) =>
        u.fullname.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.phone?.includes(debouncedSearch),
    );

    if (filterStatus === "verified") {
      filtered = filtered.filter((u) => u.isVerified);
    } else if (filterStatus === "unverified") {
      filtered = filtered.filter((u) => !u.isVerified);
    }

    setFilteredUsers(filtered);
  }, [debouncedSearch, users, filterStatus]);

  const fetchUsers = async () => {
    try {
      console.log("📡 Fetching users from API...");
      setRefreshing(true);
      setError(""); // Clear previous errors

      const response = await fetch("http://localhost:3001/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Fetched users:", data.data.length);
      setUsers(data.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("❌ Fetch error:", err.message);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      setVerifying(userId);
      setError(""); // Clear previous errors

      const response = await fetch(
        `http://localhost:3001/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isVerified: !currentStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }

      // ✅ Optimistic update
      const updatedUsers = users.map((u) =>
        u._id === userId ? { ...u, isVerified: !currentStatus } : u,
      );
      setUsers(updatedUsers);

      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, isVerified: !currentStatus });
      }

      console.log("✅ User verification status updated");

      // ✅ Refetch after 500ms to verify persistence
      setTimeout(() => {
        fetchUsers();
      }, 500);
    } catch (err: any) {
      console.error("❌ Verify error:", err.message);
      setError(err.message);
      // Refetch to restore actual state from server
      setTimeout(() => {
        fetchUsers();
      }, 500);
    } finally {
      setVerifying("");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setDeleting(userId);
      setError(""); // Clear previous errors

      const response = await fetch(
        `http://localhost:3001/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      console.log("✅ User deleted");
      setUsers(users.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch (err: any) {
      console.error("❌ Delete error:", err.message);
      setError(err.message);
    } finally {
      setDeleting("");
    }
  };

  // ✅ Calculate stats
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const unverifiedCount = users.filter((u) => !u.isVerified).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl">
            <div className="text-3xl">👥</div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent font-poppins">
              Manage Users
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-inter mt-1">
              Oversee and manage all user accounts and verification status
            </p>
          </div>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-6"></div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="primary"
            size="lg"
            isLoading={refreshing}
            onClick={fetchUsers}
          >
            <RefreshCw className="w-5 h-5" />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 hover:border-blue-400/80 dark:hover:border-blue-600 transition">
            <div className="flex items-center justify-between">
              <div className="">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {users.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 hover:border-green-400/80 dark:hover:border-green-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Verified
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {verifiedCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 dark:from-yellow-900/30 dark:to-yellow-800/30 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-700/50 rounded-2xl p-6 hover:border-yellow-400/80 dark:hover:border-yellow-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {unverifiedCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <UserX className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          🔄 Last updated: {lastUpdated.toLocaleTimeString()} on{" "}
          {lastUpdated.toLocaleDateString()}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                filterStatus === "all"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilterStatus("verified")}
              className={`px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                filterStatus === "verified"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus("unverified")}
              className={`px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                filterStatus === "unverified"
                  ? "bg-yellow-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Pending ({unverifiedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <AdminTable
        headers={["Name", "Email", "Phone", "City", "Status", "Actions"]}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <AdminTableRow key={user._id}>
              <AdminTableCell className="font-semibold">
                {user.fullname}
              </AdminTableCell>
              <AdminTableCell className="text-xs break-all">
                {user.email}
              </AdminTableCell>
              <AdminTableCell>{user.phone || "-"}</AdminTableCell>
              <AdminTableCell>{user.city || "-"}</AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={user.isVerified ? "success" : "warning"}
                  size="sm"
                  icon={
                    user.isVerified ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )
                  }
                >
                  {user.isVerified ? "Verified" : "Pending"}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleVerify(user._id, user.isVerified || false)
                    }
                    disabled={verifying === user._id}
                    className={`p-2 rounded-lg transition disabled:opacity-50 ${
                      user.isVerified
                        ? "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                        : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }`}
                    title={user.isVerified ? "Unverify" : "Verify"}
                  >
                    {verifying === user._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : user.isVerified ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={deleting === user._id}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
                    title="Delete user"
                  >
                    {deleting === user._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))
        ) : (
          <AdminTableRow>
            <AdminTableCell colSpan={6} className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </AdminTableCell>
          </AdminTableRow>
        )}
      </AdminTable>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        onVerify={handleVerify}
        onDelete={handleDelete}
        isVerifying={verifying === selectedUser?._id}
        isDeleting={deleting === selectedUser?._id}
      />
    </div>
  );
}
