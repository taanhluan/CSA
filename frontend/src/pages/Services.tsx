import React, { useEffect, useState } from "react";
import ServiceEditorTable from "../components/ServiceEditorTable";
import axios from "axios";

const ServiceAdminPage = () => {
  const [services, setServices] = useState([]);

  // 🛜 Fetch từ backend khi trang mở
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("https://csa-backend-v90k.onrender.com/api/services");
        setServices(res.data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu dịch vụ:", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">📦 Quản lý Dịch vụ</h1>

      <p className="text-sm text-gray-600 mb-4">
        Dữ liệu được tải từ hệ thống backend. Bạn có thể sửa đổi và lưu lại để đồng bộ.
      </p>

      <ServiceEditorTable
        initialServices={services}
        onUpdate={(updated) => {
          console.log("✅ Dịch vụ đã cập nhật:", updated);
          localStorage.setItem("service_data", JSON.stringify(updated));
          // 👉 TODO: axios.post("/api/services", updated)
        }}
      />
    </div>
  );
};

export default ServiceAdminPage;
