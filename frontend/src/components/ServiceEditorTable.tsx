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

    // ✅ Sửa tại đây: không mutate trực tiếp mà dùng map()
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

  // ✅ Nếu item có ID (đã có trong DB), gọi API xóa
  if (item.id) {
    const confirm = window.confirm("Bạn có chắc muốn xóa dịch vụ này?");
    if (!confirm) return;

    try {
      await deleteService(item.id);
      toast.success("🗑️ Đã xóa dịch vụ khỏi hệ thống");
    } catch (err) {
      toast.error("❌ Không thể xóa dịch vụ từ server");
      return; // ⛔ Dừng lại, không xóa khỏi FE nếu BE lỗi
    }
  }

  // ✅ Xóa khỏi danh sách hiển thị
  const updated = services.filter((_, i) => i !== index);
  setServices(updated);
  onUpdate(updated);
};

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4 text-indigo-700">📋 Danh sách dịch vụ</h2>

      {services.length === 0 ? (
        <p className="text-gray-500 text-center py-4">⚠️ Không có dịch vụ nào để hiển thị.</p>
      ) : (
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Tên dịch vụ</th>
              <th className="border px-3 py-2">Đơn giá (VNĐ)</th>
              <th className="border px-3 py-2">Số lượng</th>
              <th className="border px-3 py-2">Phân loại</th>
              <th className="border px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item, index) => (
              <tr key={item.id ?? index}>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>

                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={item.unit_price.toLocaleString("vi-VN")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const clean = raw.replace(/^0+/, "");
                      handleChange(index, "unit_price", parseInt(clean || "0"));
                    }}
                    className="w-full px-2 py-1 border rounded text-right"
                    inputMode="numeric"
                  />
                </td>

                <td className="border px-3 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", parseInt(e.target.value || "0"))
                    }
                    className="w-full px-2 py-1 border rounded text-right"
                    min={0}
                  />
                </td>

                <td className="border px-3 py-2">
                  <select
                    value={item.category_id || ""}
                    onChange={(e) => handleChange(index, "category_id", e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">-- Chọn nhóm --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => removeRow(index)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 text-left">
        <button
          onClick={addRow}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          ➕ Thêm dòng
        </button>
      </div>
    </div>
  );
};

export default ServiceEditorTable;
