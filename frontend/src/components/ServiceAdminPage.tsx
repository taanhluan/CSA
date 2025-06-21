import { useEffect, useState } from "react";
import ServiceEditorTable from "../components/ServiceEditorTable";
import { ServiceItem } from "../types"; // ✅ import chuẩn

const ServiceAdminPage = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const storageKey = "service_catalog";

  // ✅ Fetch từ backend (hoặc local nếu fail)
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
        console.error("❌ Lỗi API, fallback local:", err);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setServices(JSON.parse(stored));
        }
      }
    };

    fetchServices();
  }, []);

  // ✅ Gửi toàn bộ danh sách xuống backend (bỏ ID)
const handleSave = async () => {
  try {
    const payload = services.map(({ name, unit_price }) => ({
      name,
      unit_price,
    }));

    const res = await fetch("https://csa-backend-v90k.onrender.com/api/services/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Lưu thất bại");

    localStorage.setItem(storageKey, JSON.stringify(services));
    alert("✅ Lưu thành công!");
    window.location.reload();
  } catch (err) {
    console.error("❌ Lỗi khi lưu:", err);
    alert("❌ Không thể lưu dữ liệu xuống backend.");
  }
};


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">📦 Quản lý Dịch vụ</h1>

      <p className="text-sm text-gray-600 mb-4">
        Dữ liệu được tải từ hệ thống backend. Bạn có thể sửa đổi và bấm <strong>Lưu</strong> để đồng bộ.
      </p>

      <ServiceEditorTable
        initialServices={services}
        onUpdate={setServices}
      />

      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm"
        >
          💾 Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default ServiceAdminPage;
