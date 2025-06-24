import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4">
      <h1 className="text-xl font-bold mb-6">CSA</h1>
      <nav className="flex flex-col space-y-2">
        <Link to="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded">Dashboard</Link>
        <Link to="/Booking" className="hover:bg-gray-700 px-3 py-2 rounded">Booking</Link>
        <Link to="/members" className="hover:bg-gray-700 px-3 py-2 rounded">Members</Link>
        
        {/* ✅ THÊM DÒNG NÀY */}
        <Link to="/services" className="hover:bg-gray-700 px-3 py-2 rounded">Dịch vụ</Link>
      </nav>
    </div>
  );
};

export default Sidebar;

