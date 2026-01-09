import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  ClipboardList,
  CalendarDays,
  MapPin,
  User,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();
  const [notes, setNotes] = useState({});
  // store per-booking amount inputs when provider accepts a booking
  const [amounts, setAmounts] = useState({});

  useEffect(() => {
    // only load bookings for providers whose account is active
    if (user && user.role === 'PROVIDER' && user.status === 'active') {
      api
        .get("/api/bookings", { params: { providerId: user.id } })
        .then((r) =>
          setBookings(Array.isArray(r.data) ? r.data : r.data.value || [])
        )
        .catch(() => setBookings([]));
    } else {
      // clear bookings if not active or no user
      setBookings([]);
    }
  }, [user]);

  const handleUpdate = async (b, payload, successMessage) => {
    try {
      const res = await api.patch(`/api/bookings/${b.id}`, payload);
      setBookings((bs) => bs.map((x) => (x.id === b.id ? res.data : x)));
      toast.success(successMessage);
      setNotes((n) => ({ ...n, [b.id]: "" }));
    } catch (err) {
      try {
        const params = new URLSearchParams(payload);
        const res = await api.post(
          `/api/bookings/${b.id}/note-form?${params.toString()}`,
          null,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        setBookings((bs) => bs.map((x) => (x.id === b.id ? res.data : x)));
        toast.success(successMessage);
        setNotes((n) => ({ ...n, [b.id]: "" }));
      } catch (e) {
        toast.error("Update failed");
      }
    }
  };

  if (!user)
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Provider Dashboard
        </h2>
        <p className="text-gray-600">You must be logged in to view bookings.</p>
      </div>
    );

  // If provider is not yet active, show approval page only
  if (user.role === 'PROVIDER' && user.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">Your provider account is under review by an administrator.</p>
          <p className="text-sm text-gray-500 mb-6">Current status: <strong>{user.status || 'pending'}</strong>{user.status1 ? ` — ${user.status1}` : ''}</p>
          <p className="text-gray-700">You will be notified once your account is approved. In the meantime you cannot access bookings or service pages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <ClipboardList size={28} className="text-blue-600" />
          Provider Bookings
        </h2>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center text-gray-600 bg-gray-50 py-10 rounded-lg shadow-sm">
          No bookings assigned yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="border border-gray-200 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  {b.service?.serviceName || "Unnamed Service"}
                </h3>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    b.status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : b.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              {/* Booking details */}
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-1">
                  <User size={15} /> User: {b.user?.name ?? "—"}
                </p>
                <p className="flex items-center gap-1">
                  <CalendarDays size={15} /> {new Date(b.date).toLocaleString()}
                </p>
                <p className="flex items-center gap-1">
                  <MapPin size={15} /> {b.address}
                </p>
                {/* Show user's note (if any) so provider can see what the user wrote when booking */}
                {b.userNote && (
                  <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded mt-2">
                    <p className="text-sm text-gray-800">
                      <strong>User note:</strong> {b.userNote}
                    </p>
                  </div>
                )}

                {/* Provider note shown in a highlighted block (matches user view) */}
                {b.providerNote ? (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mt-2">
                    <p className="text-sm text-blue-800">
                      <strong>Provider note:</strong> {b.providerNote}
                    </p>
                  </div>
                ) : (
                  <p className="flex items-center gap-1 text-gray-700">
                    <MessageSquare size={15} /> Provider Note: —
                  </p>
                )}
              </div>

              {/* Note input */}
              <div className="mt-4">
                <textarea
                  rows="2"
                  placeholder="Write a note (e.g., I'll arrive in 30 mins)"
                  value={notes[b.id] ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [b.id]: e.target.value }))
                  }
                  className="border p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Buttons: show actions conditionally based on booking status */}
              <div className="mt-4 flex flex-wrap gap-2">
                {b.status === 'BOOKED' && (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount (INR)"
                      value={(amounts && amounts[b.id]) ?? ''}
                      onChange={(e) => setAmounts(a => ({ ...(a||{}), [b.id]: e.target.value }))}
                      className="border p-2 rounded w-36 text-sm"
                    />

                    <button
                      onClick={async () => {
                        const amt = parseFloat((amounts && amounts[b.id]) ?? NaN);
                        if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return }
                        try {
                          const res = await api.post(`/api/bookings/${b.id}/accept`, { amount: amt, providerNote: notes[b.id] ?? '' })
                          const booking = res.data.booking ?? res.data
                          setBookings(bs => bs.map(x => x.id === b.id ? booking : x))
                          toast.success('Booking accepted — payment requested')
                        } catch (e) {
                          toast.error(e.response?.data?.error || 'Failed to accept')
                        }
                      }}
                      className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleUpdate(b, { status: "REJECTED", providerNote: notes[b.id] ?? "" }, "Booking rejected")
                      }
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </>
                )}

                {b.status !== 'BOOKED' && b.status !== 'REJECTED' && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdate(
                          b,
                          { status: "IN_PROGRESS", providerNote: notes[b.id] ?? "" },
                          "Marked as In Progress"
                        )
                      }
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                      <Clock size={16} /> In Progress
                    </button>

                    <button
                      onClick={() =>
                        handleUpdate(
                          b,
                          { providerNote: notes[b.id] ?? "" },
                          "Note added"
                        )
                      }
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Send size={16} /> Add Note
                    </button>

                    <button
                      onClick={() =>
                        handleUpdate(b, { status: "COMPLETED" }, "Booking marked as Completed")
                      }
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle size={16} /> Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
