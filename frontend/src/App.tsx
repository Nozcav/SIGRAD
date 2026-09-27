import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import StudentLayout from "./components/layout/StudentLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/auth/Login";
import SetNewPassword from "./pages/auth/SetNewPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MyResponses from "./pages/student/MyResponses";
import PendingComments from "./pages/student/PendingComments";
import ResponseDetail from "./pages/student/ResponseDetail";
import StudentDashboard from "./pages/student/StudentDashboard";
import TakeForm from "./pages/student/TakeForm";
import CreateForm from "./pages/teacher/CreateForm";
import EditForm from "./pages/teacher/EditForm";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherResponseDetail from "./pages/teacher/TeacherResponseDetail";
import TeacherResponses from "./pages/teacher/TeacherResponses";
import Unauthorized from "./pages/Unauthorized";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Muestra el layout del rol actual; permite compartir rutas como /profile.
const RoleLayout = () => {
  const { user } = useAuth();

  if (user?.role === "ADMIN") return <AdminLayout />;
  if (user?.role === "TEACHER") return <TeacherLayout />;
  return <StudentLayout />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/change-password" element={<SetNewPassword />} />
        <Route element={<RoleLayout />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/forms/:code" element={<TakeForm />} />
          <Route path="/student/responses" element={<MyResponses />} />
          <Route path="/student/responses/:id" element={<ResponseDetail />} />
          <Route path="/student/pending" element={<PendingComments />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/forms/new" element={<CreateForm />} />
          <Route path="/teacher/forms/:id/edit" element={<EditForm />} />
          <Route path="/teacher/forms/:formId/responses" element={<TeacherResponses />} />
          <Route path="/teacher/responses/:id" element={<TeacherResponseDetail />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
