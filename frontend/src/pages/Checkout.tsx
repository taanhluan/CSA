import React, { useState } from "react";

const Checkout = () => {
  const [uuid, setUuid] = useState("");
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-center text-pink-600 flex items-center gap-2">
          <span>📤</span> Checkout Booking
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã Booking (UUID)
            </label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="Nhập mã booking..."
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vai trò:
            </label>
            <p className="mt-1 text-gray-800">Nhân viên</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="h-5 w-5 text-pink-600"
            />
            <label className="text-sm text-gray-700 font-medium">
              Xác nhận Checkout
            </label>
          </div>
        </div>

        <button className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-md">
          Gửi Checkout
        </button>
      </div>
    </div>
  );
};

export default Checkout;
