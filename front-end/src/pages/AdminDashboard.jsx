import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [pendingRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/providers/pending'),
        api.get('/api/admin/users'),
        api.get('/api/admin/bookings')
      ]);
      setPendingProviders(pendingRes.data);
      setAllUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
    }
  };

  const handleVerifyProvider = async (providerId) => {
    try {
      await api.post(`/api/admin/providers/${providerId}/verify`);
      loadData();
    } catch (error) {
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await api.post(`/api/admin/users/${userId}/status`, { status });
      loadData();
    } catch (error) {
      // failed to update status
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4 items-center">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Providers
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('users')}
          >
            Users Management
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'bookings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('bookings')}
          >
            All Bookings
          </button>
        </div>
      </div>

        {activeTab === 'pending' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Providers</h2>
            <div className="grid gap-4">
              {pendingProviders.map(provider => (
                <div key={provider.id} className="border p-4 rounded">
                  <h3 className="font-bold">{provider.name}</h3>
                  <p>Email: {provider.email}</p>
                  <p>Service: {provider.serviceType}</p>
                  <p>Location: {provider.district}, {provider.state}</p>
                  <button
                    onClick={() => handleVerifyProvider(provider.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Verify Provider
                  </button>
                </div>
              ))}
              {pendingProviders.length === 0 && (
                <p>No pending providers</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Users Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.role}</td>
                      <td className="p-2">{user.status || 'N/A'}</td>
                      <td className="p-2">
                        {user.role !== 'ADMIN' ? (
                          <div className="flex gap-2">
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(user.id, 'inactive')}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(user.id, 'active')}
                                className="bg-green-500 text-white px-2 py-1 rounded"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Service</th>
                    <th className="p-2">Provider</th>
                    <th className="p-2">User</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b">
                      <td className="p-2">{booking.service.serviceName}</td>
                      <td className="p-2">{booking.service.provider.name}</td>
                      <td className="p-2">{booking.user.name}</td>
                      <td className="p-2">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td className="p-2">{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
  );
};

export default AdminDashboard;