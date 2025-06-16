import { useState } from "react";
import MemberForm from "../components/MemberForm";
import MemberDashboard from "../components/MemberDashboard";

const MembersPage = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 Quản lý Hội viên</h1>
      <MemberForm onCreated={() => setRefresh(!refresh)} />
      <MemberDashboard refresh={refresh} />
    </div>
  );
};

export default MembersPage;
