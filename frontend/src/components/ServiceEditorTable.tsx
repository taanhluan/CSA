import { useEffect, useState } from "react";
import { ServiceItem } from "../constants/services";

interface Props {
  initialServices: ServiceItem[];
  onUpdate: (updated: ServiceItem[]) => void;
}

const ServiceEditorTable = ({ initialServices, onUpdate }: Props) => {
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  useEffect(() => {
    onUpdate(services);
  }, [services, onUpdate]);

const handleChange = (
  index: number,
  key: keyof ServiceItem,
  value: string | number
) => {
  const updated = [...services];
  (updated[index] as Record<string, any>)[key] = key === "unit_price" ? Number(value) : value;
  setServices(updated);
};

  const addRow = () => {
    setServices([
      ...services,
      { id: `id_${Date.now()}`, name: "", unit_price: 0 },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
  };

  const exportJSON = () => {
    const json = JSON.stringify(services, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "services.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4 text-indigo-700">📋 Danh sách dịch vụ</h2>
      <table className="table-auto w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Tên dịch vụ</th>
            <th className="border px-3 py-2">Đơn giá (VNĐ)</th>
            <th className="border px-3 py-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item, index) => (
            <tr key={item.id}>
              <td className="border px-3 py-2 text-gray-500">{item.id}</td>
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
                  onChange={(e) =>
                    handleChange(index, "unit_price", e.target.value)
                  }
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

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={addRow}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          ➕ Thêm dòng
        </button>

        <button
          onClick={exportJSON}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          📤 Xuất JSON
        </button>
      </div>
    </div>
  );
};

export default ServiceEditorTable;
