import { useEffect, useState } from "react";
import ServiceEditorTable from "../components/ServiceEditorTable";
import { ServiceItem } from "../types";
import styles from "./ServiceAdminPage.module.css";
import toast from "react-hot-toast";

const ServiceAdminPage = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const storageKey = "service_catalog";

  const fetchServices = async () => {
    setLoading(true);
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

      toast.success("✅ Tải dữ liệu thành công");
    } catch (err) {
      console.error("❌ Lỗi API, dùng local:", err);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setServices(JSON.parse(stored));
        toast("⚠️ Đang dùng dữ liệu local");
      } else {
        toast.error("❌ Không thể tải dữ liệu dịch vụ");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
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
      toast.success("✅ Lưu thành công!");
      await fetchServices(); // reload lại dữ liệu
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      toast.error("❌ Không thể lưu dữ liệu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>📦 Quản lý Dịch vụ</h1>

      <p className={styles.description}>
        Dữ liệu được tải từ hệ thống backend. Bạn có thể sửa đổi và bấm <strong>Lưu</strong> để đồng bộ.
      </p>

      {loading ? (
        <p className="text-gray-600">Đang tải dịch vụ...</p>
      ) : (
        <ServiceEditorTable initialServices={services} onUpdate={setServices} />
      )}

      <div className="text-right mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={styles.saveBtn}
        >
          {isSaving ? "💾 Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default ServiceAdminPage;
