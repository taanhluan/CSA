import React, { useEffect, useState } from "react";
import ServiceEditorTable from "../components/ServiceEditorTable";
import { ServiceItem } from "../types";
import axios from "axios";

const ServicesPage = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🛜 Fetch dịch vụ và category khi mở trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resServices, resCategories] = await Promise.all([
          axios.get("https://csa-backend-v90k.onrender.com/api/services"),
          axios.get("https://csa-backend-v90k.onrender.com/api/categories"),
        ]);
        setServices(resServices.data);
        setCategories(resCategories.data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
        const cached = localStorage.getItem("service_data");
        if (cached) {
          setServices(JSON.parse(cached));
        }
      }
    };

    fetchData();
  }, []);

  // ✅ Lưu dịch vụ
  const handleSave = async () => {
    try {
      setLoading(true);

      const cleaned = services
        .filter((s) => s.name && s.unit_price !== undefined && s.quantity !== undefined)
        .map(({ id, name, unit_price, quantity, category_id }) => ({
          id,
          name,
          unit_price,
          quantity,
          category_id: category_id || undefined,
        }));

      console.log("🚀 Payload gửi lên:", cleaned);

      const res = await axios.post(
        "https://csa-backend-v90k.onrender.com/api/services",
        cleaned,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200 || res.status === 201) {
        alert("✅ Dữ liệu dịch vụ đã được lưu!");
        localStorage.setItem("service_data", JSON.stringify(cleaned));
      } else {
        throw new Error("Lỗi từ server");
      }
    } catch (error) {
      console.error("❌ Không thể lưu dịch vụ:", error);
      alert("❌ Lưu thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">📦 Quản lý Dịch vụ</h1>

      <p className="text-sm text-gray-600 mb-4">
        Dữ liệu được tải từ hệ thống backend. Bạn có thể sửa đổi và bấm <b>Lưu</b> để đồng bộ.
      </p>

      <ServiceEditorTable
        initialServices={services}
        categories={categories}
        onUpdate={(updated) => {
          const cleaned = updated.map((item) => ({
            ...item,
            category_id: item.category_id ?? undefined,
          }));
          setServices(cleaned);
        }}
      />

      <div className="text-right mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          {loading ? "Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;
