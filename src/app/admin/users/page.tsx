'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  UserX,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Key,
  Crown,
  User,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Check,
  ShieldAlert,
  Boxes,
  Layers,
  FolderOpen,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  Bot,
  Clock,
  Database,
  SlidersHorizontal,
  Users as UsersIcon,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '@/lib/api';
import bcrypt from 'bcryptjs';
import { useConfirm } from '@/components/ConfirmModal';

const AVAILABLE_MODULES = [
  {
    key: 'products',
    name: 'Equipment Catalog',
    desc: 'Medical equipment, specifications, models & pricing',
    category: 'Catalog',
    icon: Boxes,
    isStandard: true,
  },
  {
    key: 'categories',
    name: 'Categories & Brands',
    desc: 'Classification hierarchy & OEM manufacturer brands',
    category: 'Catalog',
    icon: Layers,
    isStandard: true,
  },
  {
    key: 'media',
    name: 'Media & Documents',
    desc: 'Equipment photos, brochures, manuals, and CDN documents',
    category: 'Catalog',
    icon: FolderOpen,
    isStandard: true,
  },
  {
    key: 'enquiries',
    name: 'Customer Enquiries & RFQ',
    desc: 'Incoming requisitions, pipeline triage & client messages',
    category: 'Sales',
    icon: FileSpreadsheet,
    isStandard: true,
  },
  {
    key: 'quotations',
    name: 'Commercial Quotations',
    desc: 'Pricing calculations, quote numbers & Gmail auto-fill',
    category: 'Sales',
    icon: FileCheck,
    isStandard: true,
  },
  {
    key: 'support',
    name: 'Technical Support & Tickets',
    desc: 'ICU breakdown dispatch, calibration & maintenance SLA',
    category: 'Operations',
    icon: Headphones,
    isStandard: true,
  },
  {
    key: 'ai',
    name: 'AI Chatbot & Knowledge Base',
    desc: 'Client conversations, RAG knowledge FAQ & bot tuning',
    category: 'AI Intelligence',
    icon: Bot,
    isStandard: true,
  },
  {
    key: 'logs',
    name: 'Audit & Activity Logs',
    desc: 'Audit trails & operational tracking logs across platform',
    category: 'Security',
    icon: Clock,
    isStandard: true,
  },
  {
    key: 'database',
    name: 'Database Explorer',
    desc: 'Direct Firestore collections & raw document JSON editor',
    category: 'System Core',
    icon: Database,
    isStandard: false,
    sensitive: true,
  },
  {
    key: 'settings',
    name: 'Website Settings Hub',
    desc: 'Global configurations, Web3Forms API, email routing',
    category: 'System Core',
    icon: SlidersHorizontal,
    isStandard: false,
    sensitive: true,
  },
  {
    key: 'users',
    name: 'Personnel & RBAC Access',
    desc: 'Manage administrator accounts, credentials & permissions',
    category: 'System Core',
    icon: UsersIcon,
    isStandard: false,
    sensitive: true,
  },
];

const STANDARD_PERMISSIONS = AVAILABLE_MODULES.filter((m) => m.isStandard).map((m) => m.key);
const ALL_PERMISSIONS = AVAILABLE_MODULES.map((m) => m.key);

export default function AdminUsersPage() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enablePasswordChange, setEnablePasswordChange] = useState(false);
  const [formRole, setFormRole] = useState('Admin');
  const [formStatus, setFormStatus] = useState('Active');
  const [formPhone, setFormPhone] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>(STANDARD_PERMISSIONS);

  // Current logged in user from localStorage
  const [currentSessionUser, setCurrentSessionUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
    try {
      const stored = localStorage.getItem('medlab_user');
      if (stored) setCurrentSessionUser(JSON.parse(stored));
    } catch {}
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
      showToast('Error loading users directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const superAdminUser = users.find((u) => u.role === 'Super Admin') || {
    name: 'Super Admin',
    email: 'admin@medlabinnovate.co.ke',
    role: 'Super Admin',
    status: 'Active',
    lastLogin: new Date().toISOString()
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setShowPassword(false);
    setEnablePasswordChange(true);
    setFormRole('Admin');
    setFormStatus('Active');
    setFormPhone('');
    setFormPermissions([]);
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPassword('');
    setShowPassword(false);
    setEnablePasswordChange(false);
    setFormRole(user.role || 'Admin');
    setFormStatus(user.status || 'Active');
    setFormPhone(user.phone || '');
    if (user.role === 'Super Admin') {
      setFormPermissions(ALL_PERMISSIONS);
    } else {
      setFormPermissions(
        Array.isArray(user.permissions) ? user.permissions : STANDARD_PERMISSIONS
      );
    }
    setShowModal(true);
  };

  const togglePermission = (modKey: string) => {
    if (formPermissions.includes(modKey)) {
      setFormPermissions(formPermissions.filter((k) => k !== modKey));
    } else {
      setFormPermissions([...formPermissions, modKey]);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const assignedPerms =
        formRole === 'Super Admin' ? ALL_PERMISSIONS : formPermissions;

      const payload: any = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        role: formRole,
        status: formStatus,
        phone: formPhone.trim(),
        permissions: assignedPerms,
      };

      if (editingUser) {
        if (enablePasswordChange) {
          if (!formPassword.trim()) {
            throw new Error('Please enter a new password or toggle off the Change Password option.');
          }
          if (formPassword.trim().length < 6) {
            throw new Error('New password must be at least 6 characters long.');
          }
          payload.password = await bcrypt.hash(formPassword.trim(), 10);
        }

        const docId = editingUser._id || editingUser.id;
        await api.updateUser(docId, payload);
        showToast(
          enablePasswordChange
            ? `Account credentials and password for ${formName} updated successfully.`
            : `Account for ${formName} updated successfully.`
        );

        // If updating currently logged in user, keep localStorage session in sync
        if (currentSessionUser && (currentSessionUser.id === docId || currentSessionUser.email === editingUser.email)) {
          const updatedSession = {
            ...currentSessionUser,
            name: formName.trim(),
            email: formEmail.trim().toLowerCase(),
            phone: formPhone.trim(),
            role: formRole,
            permissions: assignedPerms,
          };
          localStorage.setItem('medlab_user', JSON.stringify(updatedSession));
          setCurrentSessionUser(updatedSession);
        }
      } else {
        if (!formPassword.trim()) {
          throw new Error('A secure password is required for creating a new user account.');
        }
        if (formPassword.trim().length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        payload.password = await bcrypt.hash(formPassword.trim(), 10);
        await api.createUser(payload);
        showToast(`New account for ${formName} (${formRole}) created.`);
      }

      setShowModal(false);
      await loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Error saving user account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.role === 'Super Admin') {
      showToast('The Super Admin master account cannot be deleted.', 'error');
      return;
    }

    const ok = await confirm({
      title: 'Revoke Administrative Access',
      message: `Permanently delete account for "${user.name}" (${user.email})? This user will no longer be able to log in.`,
      confirmText: 'Revoke Access',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const docId = user._id || user.id;
      await api.deleteUser(docId);
      showToast(`Account for ${user.name} removed from the system.`);
      setUsers(users.filter((u) => (u._id || u.id) !== docId));
    } catch (err: any) {
      showToast(err.message || 'Error deleting user account.', 'error');
    }
  };

  const permissionsMatrix = [
    { module: 'Product Catalog & Technical Specs', superAdmin: 'Full Access', admin: 'Full Access', scope: 'Add, edit, remove products, dynamic specifications, images, and PDF manuals' },
    { module: 'Customer Enquiries & RFQ Messages', superAdmin: 'Full Access', admin: 'Full Access', scope: 'Review incoming requisitions, modify pipeline status, add internal notes, and follow up' },
    { module: 'Commercial Quotations & Invoicing', superAdmin: 'Full Access', admin: 'Full Access', scope: 'Draft, calculate equipment pricing, generate quotation numbers, and send to clients' },
    { module: 'Technical Support & Service Tickets', superAdmin: 'Full Access', admin: 'Full Access', scope: 'Track equipment maintenance, repairs, emergency tickets, and calibration reports' },
    { module: '24/7 AI Chatbot & Knowledge Base', superAdmin: 'Full Access', admin: 'Full Access', scope: 'Configure chatbot greeting/guardrails, audit client chat logs, and add FAQ articles' },
    { module: 'Audit & System Activity Logs', superAdmin: 'Full Access', admin: 'Full Access', scope: 'Inspect timestamped audit logs of all administrator actions across the platform' },
    { module: 'Live Firestore Database Manager', superAdmin: 'Full Access', admin: 'Configurable', scope: 'Direct collection querying, raw JSON document editing, adding/deleting records, and backups' },
    { module: 'Website Settings & Email Routing', superAdmin: 'Full Access', admin: 'Configurable', scope: 'Web3Forms API credentials, email alert routing, customer auto-responder, and maintenance mode' },
    { module: 'User Accounts & Security RBAC', superAdmin: 'Full Access', admin: 'Configurable', scope: 'Create additional administrator accounts, edit credentials, or assign module permissions' },
  ];

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const nameMatch = (u.name || '').toLowerCase().includes(q);
    const emailMatch = (u.email || '').toLowerCase().includes(q);
    const roleMatch = roleFilter === 'All' || u.role === roleFilter;
    return (nameMatch || emailMatch) && roleMatch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Security Administration</span>
              <span>•</span>
              <span className="text-sky-600 font-bold">Access Control Hub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Personnel Directory &amp; RBAC Control</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Control admin access, grant or revoke individual module permissions, and maintain the Super Admin master account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Admin Account</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Super Admin Master Identity Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Root Account</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-900">Master Super Admin</span>
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {superAdminUser.name} <span className="font-mono text-xs text-slate-500 font-normal">({superAdminUser.email})</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Full authority across all database collections, personnel permissions assignment, Web3Forms credentials &amp; platform security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Unrestricted Master RBAC</span>
          </span>
        </div>
      </div>

      {/* Authorized Personnel Directory Shelf */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Authorized Personnel Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active administrative credentials with assigned module permissions</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search staff name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200/80 bg-slate-50/70 text-slate-700 outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin (Owner)</option>
              <option value="Admin">Admin (Operations)</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4">Name &amp; Role</th>
                <th className="px-6 py-4">Official Email</th>
                <th className="px-6 py-4">Granted Module Access</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
                    <span>Loading directory records from Firestore...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 text-sm">No personnel accounts match filter</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentSuper = u.role === 'Super Admin';
                  const userPerms: string[] = isCurrentSuper
                    ? ALL_PERMISSIONS
                    : Array.isArray(u.permissions)
                    ? u.permissions
                    : STANDARD_PERMISSIONS;

                  return (
                    <tr key={u._id || u.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {isCurrentSuper ? (
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                              <Crown className="w-4 h-4 text-amber-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 font-bold text-xs">
                              {u.name?.slice(0, 2)?.toUpperCase() || 'AD'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                              isCurrentSuper
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-100'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-slate-600 text-xs">
                        {u.email}
                      </td>
                      <td className="px-6 py-4.5 max-w-md">
                        {isCurrentSuper ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            <span>Master Full Access (All 11 Modules)</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {userPerms.length === 0 ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                No Modules Assigned
                              </span>
                            ) : userPerms.length === ALL_PERMISSIONS.length ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Full Access (11 Modules)
                              </span>
                            ) : (
                              userPerms.map((key) => {
                                const mod = AVAILABLE_MODULES.find((m) => m.key === key);
                                return (
                                  <span
                                    key={key}
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    {mod?.name || key}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1 rounded-full ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span>{u.status || 'Active'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition cursor-pointer text-xs font-bold"
                            title="Configure Access & Permissions"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Access</span>
                          </button>
                          {!isCurrentSuper && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Tier Role-Based Permission Matrix Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Platform Access Control (RBAC) Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin can grant or revoke any of the following 11 functional modules per administrator.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-6 py-3.5">System Module</th>
                <th className="px-4 py-3.5 text-center">Super Admin</th>
                <th className="px-4 py-3.5 text-center">Admin Access</th>
                <th className="px-6 py-3.5">Standard Capability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{row.module}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      {row.superAdmin}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100 inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-sky-600" />
                      Tick to Grant
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-500 leading-relaxed">
                    {row.scope}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Create or Edit User with Module Checkboxes */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? `Configure Access: ${editingUser.name}` : 'Create New Personnel Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Set credentials and tick module permissions for this administrator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Account Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Biomedical Sales Lead"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Official Email</label>
                  <input
                    required
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. staff@medlabinnovate.co.ke"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +254 712 345678"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role Tier</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    disabled={editingUser?.role === 'Super Admin'}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200/80 bg-slate-50/70 text-slate-700 outline-none"
                  >
                    {editingUser?.role === 'Super Admin' && (
                      <option value="Super Admin">Super Admin (Master Owner)</option>
                    )}
                    <option value="Admin">Admin (Configurable Access)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Access Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200/80 bg-slate-50/70 text-slate-700 outline-none"
                  >
                    <option value="Active">Active (Login Enabled)</option>
                    <option value="Inactive">Inactive / Suspended (Blocked)</option>
                  </select>
                </div>
              </div>

              {/* DEDICATED PASSWORD MANAGEMENT & RESET POD */}
              {editingUser ? (
                <div className={`p-4 rounded-2xl border transition-all ${
                  enablePasswordChange
                    ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-500/10'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold transition ${
                        enablePasswordChange ? 'bg-amber-100 text-amber-700' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>Change Login Password</span>
                          {enablePasswordChange && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                              Reset Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {enablePasswordChange
                            ? 'Enter the new password below. It will replace current credentials upon saving.'
                            : 'Click the toggle to enable changing or resetting this user’s password.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !enablePasswordChange;
                        setEnablePasswordChange(next);
                        if (!next) setFormPassword('');
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        enablePasswordChange ? 'bg-amber-600' : 'bg-slate-300'
                      }`}
                      aria-label="Toggle Change Password"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          enablePasswordChange ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {enablePasswordChange && (
                    <div className="mt-4 pt-3.5 border-t border-amber-200/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>New Password</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const gen = 'MedLab@' + Math.random().toString(36).slice(-6) + '!';
                            setFormPassword(gen);
                            setShowPassword(true);
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Generate Strong Password</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="Type new password (min. 6 characters)..."
                          className="w-full pl-4 pr-12 py-2.5 text-xs sm:text-sm rounded-2xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Encrypted securely via bcrypt before saving to Firestore.</span>
                        {formPassword.length > 0 && (
                          <span className={formPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                            {formPassword.length >= 6 ? '✓ Ready to Save' : `${formPassword.length}/6 characters`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-sky-600" />
                      <span>Account Password</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const gen = 'MedLab@' + Math.random().toString(36).slice(-6) + '!';
                        setFormPassword(gen);
                        setShowPassword(true);
                      }}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-sky-600" />
                      <span>Generate Strong Password</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Min 6 characters with letters and numbers"
                      className="w-full pl-4 pr-12 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    User will use this password along with official email to sign into the Medlab Admin Console.
                  </p>
                </div>
              )}

              {/* GRANULAR PERMISSIONS CHECKBOX SECTION */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Module Access Permissions (Tick to Grant Access)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Ticked modules will be accessible in the admin console. Unticked items will be hidden &amp; blocked.
                    </p>
                  </div>

                  {formRole !== 'Super Admin' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFormPermissions(STANDARD_PERMISSIONS)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                      >
                        Standard Operations
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormPermissions(ALL_PERMISSIONS)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormPermissions([])}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {formRole === 'Super Admin' ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-3">
                    <Crown className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Super Admin master account</strong> has full, permanent access across all 11 modules and cannot have permissions restricted.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_MODULES.map((mod) => {
                      const Icon = mod.icon;
                      const isChecked = formPermissions.includes(mod.key);

                      return (
                        <label
                          key={mod.key}
                          onClick={() => togglePermission(mod.key)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isChecked
                              ? 'bg-sky-50/70 border-sky-300 shadow-2xs'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="truncate">{mod.name}</span>
                                {mod.sensitive && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                                    Sensitive
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{mod.desc}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Controlled via label click
                              className="w-5 h-5 accent-sky-600 rounded-lg cursor-pointer"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 flex items-center gap-2 cursor-pointer transition active:scale-[0.98]"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Personnel & Permissions'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
