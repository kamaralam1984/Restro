export default function AdminPreviewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Preview</h1>
      <div className="bg-gray-100 p-6 rounded-lg">
        <p className="text-gray-600 mb-4">
          This page is for restaurant staff to preview orders, bookings, and manage the system.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-gray-600">View and manage customer orders</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Bookings</h2>
            <p className="text-gray-600">Manage table reservations</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Menu Management</h2>
            <p className="text-gray-600">Update menu items and availability</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Analytics</h2>
            <p className="text-gray-600">View sales and customer insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}

