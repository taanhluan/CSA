import { useState } from "react";
import { createMember } from "../api/members";
import styles from "./MemberForm.module.css";

const MemberForm = ({ onCreated }: { onCreated: () => void }) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"regular" | "vip">("regular");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

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
      setError(false);
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setType("regular");
      onCreated();
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tạo hội viên.");
      setError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.heading}>➕ Tạo hội viên mới</h2>

      <input
        className={styles.input}
        type="text"
        placeholder="Tên hội viên"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <input
        className={styles.input}
        type="tel"
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />

      <input
        className={styles.input}
        type="email"
        placeholder="Email (tuỳ chọn)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <select
        className={styles.input}
        value={type}
        onChange={(e) => setType(e.target.value as "regular" | "vip")}
      >
        <option value="regular">Hội viên thường</option>
        <option value="vip">Hội viên VIP</option>
      </select>

      <button className={styles.button} type="submit">
        💾 Lưu hội viên
      </button>

      {message && (
        <p className={error ? styles.error : styles.success}>{message}</p>
      )}
    </form>
  );
};

export default MemberForm;
