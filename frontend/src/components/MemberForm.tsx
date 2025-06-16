import { useState } from "react";
import { createMember } from "../api/members";

const MemberForm = ({ onCreated }: { onCreated: () => void }) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"regular" | "vip">("regular"); // 👈 kiểu chính xác
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMember({
        full_name: fullName,
        phone_number: phoneNumber,
        email: email || undefined,
        type,
      });
      setMessage("✅ Tạo hội viên thành công!");
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setType("regular");
      onCreated();
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tạo hội viên.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded space-y-3">
      <h2 className="text-lg font-semibold">➕ Tạo hội viên mới</h2>

      <input
        className="w-full border px-3 py-2 rounded"
        type="text"
        placeholder="Tên hội viên"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <input
        className="w-full border px-3 py-2 rounded"
        type="tel"
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />

      <input
        className="w-full border px-3 py-2 rounded"
        type="email"
        placeholder="Email (tuỳ chọn)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <select
        className="w-full border px-3 py-2 rounded"
        value={type}
        onChange={(e) => setType(e.target.value as "regular" | "vip")} // 👈 ép kiểu
      >
        <option value="regular">Hội viên thường</option>
        <option value="vip">Hội viên VIP</option>
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        💾 Lưu hội viên
      </button>

      {message && <p>{message}</p>}
    </form>
  );
};

export default MemberForm;
