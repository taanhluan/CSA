import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext"; // ✅ Thêm dòng này

function App() {
  return (
    <AuthProvider> {/* ✅ Bọc toàn bộ app */}
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;
