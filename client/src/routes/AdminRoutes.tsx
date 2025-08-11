import { lazy } from "react";
import { Route } from "react-router-dom";
import DynamicForm from "@/layouts/admin/components/dynamic/dynamic_form";
//course
// const CourseForm = lazy(
//   () => import("@/layouts/admin/components/course/CourseForm")
// );
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Category = lazy(() => import("@/pages/admin/course/Category"));
const CourseView = lazy(() => import("@/pages/admin/course/CourseView"));
const DynamicCourseList = lazy(() => import("@/pages/admin/course/DynamicCourseList"));
const Paper = lazy(() => import("@/pages/admin/course/Paper"));
//Branch
const DynamicBranchList = lazy(() => import("@/pages/admin/branch/DynamicBranchList"));
//student
const StudentList = lazy(() => import("@/pages/admin/student/List"));
const RegisteredStudents = lazy(() => import("@/pages/admin/student/RegisteredStudents"));
const PassOutStudents = lazy(() => import("@/pages/admin/student/PassOutStudents"));
// const StudentForm = lazy(
//   () => import("@/layouts/admin/components/student/StudentForm")
// );
//settings
const HeaderSettings = lazy(() => import("@/pages/admin/settings/Header"));
const FooterSettings = lazy(() => import("@/pages/admin/settings/Footer"));
const BodySettings = lazy(() => import("@/pages/admin/settings/Body"));
const ThemeSettings = lazy(() => import("@/pages/admin/settings/Theme"));

export const AdminRoutes = [
  //dashboard  
  <Route index element={<Dashboard />} />,
  <Route path="dashboard" element={<Dashboard />} />,
  //course
  <Route path="courses" element={<DynamicCourseList />} />,
  <Route path="courses/:id" element={<CourseView />} />,
  <Route path="courses/add" element={<DynamicForm formType="course" />} />, 
  <Route path="course/categories" element={<Category />} />,
  <Route path="course/papers" element={<Paper />} />,
  //Branch
  <Route path="branches/add" element={<DynamicForm formType="branch" />} />, 
  <Route path="branches" element={<DynamicBranchList />} />,
  //student
  <Route path="students/:status" element={<StudentList />} />,
  <Route path="students/add" element={<DynamicForm formType="student" />} />,
  <Route path="students/registered" element={<RegisteredStudents />} />,
  <Route path="students/passout" element={<PassOutStudents />} />,
  //settings
  <Route path="settings/header" element={<HeaderSettings />} />,
  <Route path="settings/footer" element={<FooterSettings />} />,
  <Route path="settings/body" element={<BodySettings />} />,
  <Route path="settings/theme" element={<ThemeSettings />} />,
]