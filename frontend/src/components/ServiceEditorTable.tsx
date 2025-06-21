import { useEffect, useState } from "react";
import { ServiceItem } from "../types"; // Dùng interface gốc để type props

// Interface tạm thời cho bảng chỉnh sửa
interface ServiceEditorItem {
  id?: number;
  name: string;
  unit_price: number;
}

interface Props {
  initialServices: ServiceItem[];
  onUpdate: (updated: ServiceEditorItem[]) => void;
}

const ServiceEditorTable = ({ initialServices, onUpdate }: Props) => {
  const [services, setServices] = useState<ServiceEditorItem[]>([]);

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const handleChange = (
    index: number,
    key: keyof ServiceEditorItem,
    value: string | number
  ) => {
    const updated = [...services];
    (updated[index] as any)[key] = key === "unit_price" ? Number(value) : value;
    setServices(updated);
    onUpdate(updated);
  };

  const addRow = () => {
    const updated = [...services, { name: "", unit_price: 0 }];
    setServices(updated);
    onUpdate(updated);
  };

  const removeRow = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    onUpdate(updated);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4 text-indigo-700">📋 Danh sách dịch vụ</h2>
      <table className="table-auto w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Tên dịch vụ</th>
            <th className="border px-3 py-2">Đơn giá (VNĐ)</th>
            <th className="border px-3 py-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item, index) => (
            <tr key={index}>
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
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => handleChange(index, "unit_price", e.target.value)}
                  className="w-full px-2 py-1 border rounded text-right"
                />
              </td>
              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  🗑️ Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
