"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../DashboardLayout";
import { Users, Plus, Search, Edit, Trash2, UserPlus, Mail, Phone, Shield } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "../../../components/ui/Toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "receptionist" | "patient";
  phone?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet-50 text-violet-700 border-violet-100",
  doctor: "bg-blue-50 text-blue-700 border-blue-100",
  receptionist: "bg-teal-50 text-teal-700 border-teal-100",
  patient: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  specialization?: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { success, error } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "patient",
    phone: "",
    specialization: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        apiFetch("/api/patients").catch(() => ({ data: [] })),
        apiFetch("/api/users/doctors").catch(() => ({ data: [] })),
      ]);

      const allUsers = [
        ...(patientsRes.data || []),
        ...(doctorsRes.data || []),
      ];
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      error("Validation Error", "Please fill all required fields");
      return;
    }

    try {
      if (editingUser) {
        // Update user
        await apiFetch(`/api/users/${editingUser._id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          }),
        });
        success("Success", "User updated successfully");
      } else {
        // Create user based on role
        const endpoint = formData.role === "doctor"
          ? "/api/users/doctors"
          : formData.role === "receptionist"
            ? "/api/users/staff"
            : "/api/auth/register";

        await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone: formData.phone,
            specialization: formData.specialization,
          }),
        });
        success("Success", "User created successfully");
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "patient", phone: "", specialization: "" });
      fetchUsers();
    } catch (err: any) {
      error("Error", err.message || "Operation failed");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      specialization: user.specialization || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await apiFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      success("Success", "User deactivated successfully");
      fetchUsers();
    } catch (err: any) {
      error("Error", err.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === "all" || user.role === filter;
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout requiredRole="admin">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Admin</p>
          <h1 className="text-xl font-extrabold text-slate-900">Manage Users</h1>
          <p className="text-xs text-slate-500 mt-0.5">View and manage all system users</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: "", email: "", password: "", role: "patient", phone: "", specialization: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "admin", "doctor", "receptionist", "patient"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${filter === role
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400 text-sm">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">User</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Role</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Contact</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Specialization</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Joined</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Status</th>
                  <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_COLORS[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {user.specialization || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                        }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 transition-med text-blue-600"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-med text-red-600"
                          title="Deactivate user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
              <h2 className="text-[15px] font-bold text-white">
                <div className="flex items-center gap-2">
                  {editingUser ? <Edit className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                  {editingUser ? "Edit User" : "Add New User"}
                </div>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Shield className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                  placeholder="email@example.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                    placeholder="Min. 6 characters"
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {formData.role === "doctor" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-med"
                    placeholder="e.g., Cardiology, General Medicine"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                >
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
