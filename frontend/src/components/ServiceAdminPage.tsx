import { useEffect, useState } from "react";

interface ServiceItem {
  id: string;
  name: string;
  unit_price: number;
}

const ServiceAdminPage = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [newService, setNewService] = useState<ServiceItem>({
    id: "",
    name: "",
    unit_price: 0,
  });

  const storageKey = "service_catalog";

  // ✅ Load data từ backend (hoặc local nếu lỗi)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("https://csa-backend-v90k.onrender.com/api/services/");
        const data = await res.json();

        if (Array.isArray(data)) {
          setServices(data);
        } else if (Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          throw new Error("❌ Dữ liệu không hợp lệ");
        }
      } catch (err) {
        console.error("❌ Lỗi gọi API, dùng local:", err);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setServices(JSON.parse(stored));
        } else {
          setServices([]);
        }
      }
    };

    fetchServices();
  }, []);

  // ✅ Thêm dòng mới
  const handleAdd = () => {
    if (!newService.id.trim() || !newService.name.trim()) return;
    if (services.find((s) => s.id === newService.id)) {
      alert("❌ ID đã tồn tại");
      return;
    }

    setServices([...services, newService]);
    setNewService({ id: "", name: "", unit_price: 0 });
  };

  const handleDelete = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleChange = (
    index: number,
    key: keyof ServiceItem,
    value: string | number
  ) => {
    const updated = [...services];
    (updated[index] as any)[key] = key === "unit_price" ? Number(value) : value;
    setServices(updated);
  };

  // ✅ Gửi toàn bộ danh sách về DB
  const handleSave = async () => {
    try {
      const res = await fetch("https://csa-backend-v90k.onrender.com/api/services/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(services),
      });

      if (!res.ok) throw new Error("Lỗi khi lưu");

      alert("✅ Lưu danh sách dịch vụ thành công!");
      localStorage.setItem(storageKey, JSON.stringify(services));
    } catch (err) {
      alert("❌ Không thể lưu xuống backend");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">📦 Quản lý dịch vụ</h1>

      <table className="w-full text-sm border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Tên dịch vụ</th>
            <th className="p-2">Đơn giá (VND)</th>
            <th className="p-2 text-center">Xoá</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, index) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">
                <input
                  value={s.id}
                  onChange={(e) => handleChange(index, "id", e.target.value)}
                  className="w-full border px-1 py-1 rounded"
                />
              </td>
              <td className="p-2">
                <input
                  value={s.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="w-full border px-1 py-1 rounded"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={s.unit_price}
                  onChange={(e) =>
                    handleChange(index, "unit_price", Number(e.target.value))
                  }
                  className="w-full border px-1 py-1 rounded text-right"
                />
              </td>
              <td className="p-2 text-center">
                <button
                  className="text-red-600 hover:underline text-xs"
                  onClick={() => handleDelete(s.id)}
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}

          {/* Dòng thêm mới */}
          <tr className="border-t bg-gray-50">
            <td className="p-2">
              <input
                value={newService.id}
                onChange={(e) => setNewService({ ...newService, id: e.target.value })}
                className="w-full border px-1 py-1 rounded"
              />
            </td>
            <td className="p-2">
              <input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="w-full border px-1 py-1 rounded"
              />
            </td>
            <td className="p-2">
              <input
                type="number"
                value={newService.unit_price}
                onChange={(e) =>
                  setNewService({ ...newService, unit_price: Number(e.target.value) })
                }
                className="w-full border px-1 py-1 rounded text-right"
              />
            </td>
            <td className="p-2 text-center">
              <button
                className="text-green-600 hover:underline text-xs"
                onClick={handleAdd}
              >
                ➕ Thêm
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ✅ Nút Lưu */}
      <div className="mt-4 text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          💾 Lưu
        </button>
      </div>
    </div>
  );
};

export default ServiceAdminPage;
