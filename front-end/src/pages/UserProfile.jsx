import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { toast } from 'react-toastify';
import { Lock, Edit3, User, Mail, Home, Phone, MapPin, Shield } from 'lucide-react';

export default function UserProfile() {
  const { user, login, normalizeAndLogin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    district: user?.district ?? '',
    pincode: user?.pincode ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'USER',
  });
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Profile</h2>
        <p>You must be logged in to view your profile.</p>
      </div>
    );

  const saveProfile = async (values) => {
    setSaving(true);
    try {
      const vals = values ?? draft;
      if (user?.id) {
        await api.put(`/api/users/${user.id}`, {
          name: vals.name,
          email: vals.email,
          address: vals.address,
          district: vals.district,
          pincode: vals.pincode,
          phoneNo: vals.phone,
          role: vals.role,
        });
        toast.success('Profile updated');
      }
      const updated = { ...user, ...vals };
      normalizeAndLogin ? normalizeAndLogin(updated) : login(updated);
      setDraft(updated);
      setEditing(false);
    } catch (e) {
      toast.error(e.response?.data || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      <div className="bg-white shadow-md rounded-xl p-6 max-w-lg mx-auto">
        {/* Edit / Password buttons */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
          >
            <Edit3 size={16} /> {editing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Lock size={16} /> {showPasswordForm ? 'Hide Password' : 'Change Password'}
          </button>
        </div>

        {/* Password Form */}
        {showPasswordForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded border">
            <label className="block">Old Password</label>
            <input
              type="password"
              className="border p-2 rounded w-full mb-2"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <label className="block">New Password</label>
            <input
              type="password"
              className="border p-2 rounded w-full mb-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label className="block">Confirm New Password</label>
            <input
              type="password"
              className="border p-2 rounded w-full mb-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={async () => {
                  if (!oldPassword || !newPassword) return toast.error('Please fill both fields');
                  if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
                  try {
                    await api.post(`/api/users/${user.id}/change-password`, { oldPassword, newPassword });
                    toast.success('Password changed');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowPasswordForm(false);
                  } catch (e) {
                    toast.error(e.response?.data || 'Failed to change password');
                  }
                }}
              >
                Change Password
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowPasswordForm(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile Fields */}
        {!editing ? (
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <User size={16} /> <strong>Name:</strong> {draft.name}
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} /> <strong>Email:</strong> {draft.email}
            </p>
            <p className="flex items-center gap-2">
              <Home size={16} /> <strong>Address:</strong> {draft.address || '—'}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> <strong>Phone:</strong> {draft.phone || '—'}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> <strong>District:</strong> {draft.district || '—'}
            </p>
            <p className="flex items-center gap-2">
              <Shield size={16} /> <strong>Role:</strong> {draft.role}
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-gray-700">
            <input
              className="border p-2 rounded w-full"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Name"
            />
            <input
              className="border p-2 rounded w-full"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              placeholder="Email"
            />
            <input
              className="border p-2 rounded w-full"
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
              placeholder="Address"
            />
            <input
              className="border p-2 rounded w-full"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              placeholder="Phone"
            />
            <input
              className="border p-2 rounded w-full"
              value={draft.district}
              onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))}
              placeholder="District"
            />
            <input
              className="border p-2 rounded w-full"
              value={draft.pincode}
              onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value }))}
              placeholder="Pincode"
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={saving}
                onClick={() => saveProfile(draft)}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => {
                  setEditing(false);
                  setDraft({
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    district: user.district,
                    pincode: user.pincode,
                    phone: user.phone,
                    role: user.role,
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
