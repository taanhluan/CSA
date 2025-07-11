import { useEffect, useState } from "react";
import styles from "./ServiceEditorTable.module.css";
import { ServiceItem } from "../types";
import { deleteService } from "../api/services";
import toast from "react-hot-toast";

interface ServiceEditorItem {
  id?: string;
  name: string;
  unit_price: number;
  quantity: number;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  initialServices: ServiceItem[];
  categories: Category[];
  onUpdate: (updated: ServiceEditorItem[]) => void;
}

const ServiceEditorTable = ({ initialServices, categories, onUpdate }: Props) => {
  const [services, setServices] = useState<ServiceEditorItem[]>([]);

  useEffect(() => {
    const extended = initialServices.map((s: any) => ({
      id: s.id,
      name: s.name,
      unit_price: s.unit_price,
      quantity: s.quantity ?? 0,
      category_id:
        s.category && typeof s.category === "object" && "id" in s.category
          ? s.category.id
          : s.category_id ?? "",
    }));
    setServices(extended);
  }, [initialServices]);

  const handleChange = (
    index: number,
    key: keyof ServiceEditorItem,
    value: string | number
  ) => {
    let newValue: string | number | undefined = value;
    if (key === "category_id" && value === "") newValue = undefined;
    if (key === "unit_price" || key === "quantity") {
      newValue = Number(newValue);
    }

    const updated = services.map((item, i) =>
      i === index ? { ...item, [key]: newValue } : item
    );
    setServices(updated);
    onUpdate(updated);
  };

  const addRow = () => {
    const updated = [...services, { name: "", unit_price: 0, quantity: 0 }];
    setServices(updated);
    onUpdate(updated);
  };

  const removeRow = async (index: number) => {
    const item = services[index];
    if (item.id) {
      const confirm = window.confirm("Bạn có chắc muốn xóa dịch vụ này?");
      if (!confirm) return;

      try {
        await deleteService(item.id);
        toast.success("🗑️ Đã xóa dịch vụ khỏi hệ thống");
      } catch (err) {
        toast.error("Không thể xóa dịch vụ từ server");
        return;
      }
    }

    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    onUpdate(updated);
  };

  return (
    <div style={{ padding: "1rem", background: "#fff", borderRadius: "1rem", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "1rem", color: "#4f46e5" }}>
        📋 Danh sách dịch vụ
      </h2>

      {services.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>
          ⚠️ Không có dịch vụ nào để hiển thị.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Tên dịch vụ</th>
              <th className={styles.th}>Đơn giá (VNĐ)</th>
              <th className={styles.th}>Số lượng</th>
              <th className={styles.th}>Phân loại</th>
              <th className={styles.th} style={{ textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item, index) => (
              <tr key={item.id ?? index}>
                <td className={styles.td}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className={styles.input}
                  />
                </td>

                <td className={styles.td}>
                  <input
                    type="text"
                    value={item.unit_price.toLocaleString("vi-VN")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const clean = raw.replace(/^0+/, "");
                      handleChange(index, "unit_price", parseInt(clean || "0"));
                    }}
                    className={`${styles.input} ${styles["text-right"]}`}
                    inputMode="numeric"
                  />
                </td>

                <td className={styles.td}>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", parseInt(e.target.value || "0"))
                    }
                    className={`${styles.input} ${styles["text-right"]}`}
                    min={0}
                  />
                </td>

                <td className={styles.td}>
                  <select
                    value={item.category_id || ""}
                    onChange={(e) => handleChange(index, "category_id", e.target.value)}
                    className={styles.select}
                  >
                    <option value="">-- Chọn nhóm --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className={styles.td} style={{ textAlign: "center" }}>
                  <button
                    onClick={() => removeRow(index)}
                    className={styles["button-delete"]}
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "1rem", textAlign: "left" }}>
        <button onClick={addRow} className={`${styles.button} ${styles["button-add"]}`}>
          ➕ Thêm dòng
        </button>
      </div>
    </div>
  );
};

export default ServiceEditorTable;
