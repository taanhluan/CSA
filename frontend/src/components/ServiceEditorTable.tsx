import { useEffect, useState } from "react";

export interface ServiceItem {
  id: string;
  name: string;
  unit_price: number;
}

interface Props {
  initialServices: ServiceItem[];
  onUpdate: (updated: ServiceItem[]) => void;
}

const ServiceEditorTable = ({ initialServices, onUpdate }: Props) => {
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const handleChange = (
    index: number,
    key: keyof ServiceItem,
    value: string | number
  ) => {
    const updated = [...services];
    (updated[index] as any)[key] = key === "unit_price" ? Number(value) : value;
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

  const handleSave = () => {
    onUpdate(services);
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
