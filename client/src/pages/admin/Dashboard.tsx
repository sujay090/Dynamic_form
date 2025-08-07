import { useState, useEffect } from "react";
import { Users, GraduationCap, TrendingUp, Building, BookOpen, MapPin, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDynamicFormDataAPI } from "@/API/services/studentService";

type DynamicFormData = {
  _id: string;
  formType: string;
  fieldsData: Array<{
    name: string;
    value: any;
  }>;
  createdAt: string;
  updatedAt: string;
};

function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [passOutStudents, setPassOutStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [recentStudents, setRecentStudents] = useState<DynamicFormData[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [totalBranches, setTotalBranches] = useState(0);
  const [activeBranches, setActiveBranches] = useState(0);
  const [recentCourses, setRecentCourses] = useState<DynamicFormData[]>([]);
  const [recentBranches, setRecentBranches] = useState<DynamicFormData[]>([]);
  const [loading, setLoading] = useState(true);

  // Get field value by name with support for nested structure
  const getFieldValue = (fieldsData: Array<{name: string; value: any}>, fieldName: string) => {
    // Check if fieldsData has the nested structure
    const fieldsDataField = fieldsData.find(f => f.name === 'fieldsData');
    
    if (fieldsDataField && Array.isArray(fieldsDataField.value)) {
      // If it's the nested structure, look in the value array
      const field = fieldsDataField.value.find((f: any) => f.name === fieldName);
      return field ? field.value : "N/A";
    } else {
      // If it's the direct structure, look directly
      const field = fieldsData.find(f => f.name === fieldName);
      return field?.value || "N/A";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch students data
        const studentsResponse = await getDynamicFormDataAPI("student");
        const allStudents = studentsResponse.data.data || [];
        
        // Calculate student statistics
        const totalStudentsCount = allStudents.length;
        const passOutCount = allStudents.filter((student: DynamicFormData) => {
          const completedField = student.fieldsData.find(f => f.name === 'completedCourse');
          return completedField?.value === true || 
                 completedField?.value === 'true' || 
                 completedField?.value === 'on';
        }).length;
        const activeCount = totalStudentsCount - passOutCount;
        
        // Get recent students (last 5)
        const recentStudentsData = allStudents
          .sort((a: DynamicFormData, b: DynamicFormData) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        // Fetch courses data
        const coursesResponse = await getDynamicFormDataAPI("course");
        const allCourses = coursesResponse.data.data || [];
        
        // Calculate course statistics
        const totalCoursesCount = allCourses.length;
        const activeCoursesCount = allCourses.filter((course: DynamicFormData) => {
          const isActive = getFieldValue(course.fieldsData, 'isActive');
          return isActive === true || isActive === 'true';
        }).length;
        
        // Get recent courses (last 3)
        const recentCoursesData = allCourses
          .sort((a: DynamicFormData, b: DynamicFormData) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);

        // Fetch branches data
        const branchesResponse = await getDynamicFormDataAPI("branch");
        const allBranches = branchesResponse.data.data || [];
        
        // Calculate branch statistics
        const totalBranchesCount = allBranches.length;
        const activeBranchesCount = allBranches.filter((branch: DynamicFormData) => {
          const isActive = getFieldValue(branch.fieldsData, 'isActive');
          return isActive === true || isActive === 'true';
        }).length;
        
        // Get recent branches (last 3)
        const recentBranchesData = allBranches
          .sort((a: DynamicFormData, b: DynamicFormData) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);

        // Update state
        setTotalStudents(totalStudentsCount);
        setPassOutStudents(passOutCount);
        setActiveStudents(activeCount);
        setRecentStudents(recentStudentsData);
        setTotalCourses(totalCoursesCount);
        setActiveCourses(activeCoursesCount);
        setTotalBranches(totalBranchesCount);
        setActiveBranches(activeBranchesCount);
        setRecentCourses(recentCoursesData);
        setRecentBranches(recentBranchesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="w-full p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to the admin dashboard! Complete overview of students, courses, and branches.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 w-full">
          {/* Total Students Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? "..." : totalStudents}
              </div>
              <p className="text-xs text-gray-500">All registered students</p>
            </CardContent>
          </Card>

          {/* Active Students Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? "..." : activeStudents}
              </div>
              <p className="text-xs text-gray-500">Currently studying</p>
            </CardContent>
          </Card>

          {/* Total Courses Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loading ? "..." : totalCourses}
              </div>
              <p className="text-xs text-gray-500">All courses available</p>
            </CardContent>
          </Card>

          {/* Active Courses Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {loading ? "..." : activeCourses}
              </div>
              <p className="text-xs text-gray-500">Currently offered</p>
            </CardContent>
          </Card>

          {/* Total Branches Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <Building className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? "..." : totalBranches}
              </div>
              <p className="text-xs text-gray-500">All branch locations</p>
            </CardContent>
          </Card>

          {/* Pass Out Students Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graduated</CardTitle>
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {loading ? "..." : passOutStudents}
              </div>
              <p className="text-xs text-gray-500">Completed courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Recent Students
              </CardTitle>
              <CardDescription>Latest student registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500 text-center py-4">Loading...</div>
                ) : recentStudents.length > 0 ? (
                  recentStudents.map((student) => {
                    const isPassOut = student.fieldsData.find(f => f.name === 'completedCourse')?.value;
                    return (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col">
                          <div className="font-medium text-sm">
                            {getFieldValue(student.fieldsData, "studentName")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getFieldValue(student.fieldsData, "courseName")} • {formatDate(student.createdAt)}
                          </div>
                        </div>
                        <Badge variant={isPassOut ? "secondary" : "default"} className="text-xs">
                          {isPassOut ? "Completed" : "Active"}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-center py-4">No students found</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Recent Courses
              </CardTitle>
              <CardDescription>Latest course additions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500 text-center py-4">Loading...</div>
                ) : recentCourses.length > 0 ? (
                  recentCourses.map((course) => {
                    const isActive = getFieldValue(course.fieldsData, "isActive");
                    return (
                      <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col">
                          <div className="font-medium text-sm">
                            {getFieldValue(course.fieldsData, "courseName")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getFieldValue(course.fieldsData, "category")} • ₹{getFieldValue(course.fieldsData, "fees")}
                          </div>
                        </div>
                        <Badge variant={isActive === 'true' ? "default" : "secondary"} className="text-xs">
                          {isActive === 'true' ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-center py-4">No courses found</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Branches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Recent Branches
              </CardTitle>
              <CardDescription>Latest branch additions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500 text-center py-4">Loading...</div>
                ) : recentBranches.length > 0 ? (
                  recentBranches.map((branch) => {
                    const isActive = getFieldValue(branch.fieldsData, "isActive");
                    return (
                      <div key={branch._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col">
                          <div className="font-medium text-sm">
                            {getFieldValue(branch.fieldsData, "branchName")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getFieldValue(branch.fieldsData, "city")}, {getFieldValue(branch.fieldsData, "state")}
                          </div>
                        </div>
                        <Badge variant={isActive === 'true' ? "default" : "secondary"} className="text-xs">
                          {isActive === 'true' ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-center py-4">No branches found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-full">
          {/* Overall Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Overall Statistics
              </CardTitle>
              <CardDescription>Complete system overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-blue-800">Total Registrations</div>
                    <div className="text-xs text-blue-600">All time registered students</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : totalStudents}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-purple-800">Course Offerings</div>
                    <div className="text-xs text-purple-600">Total courses available</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : totalCourses}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-orange-800">Branch Network</div>
                    <div className="text-xs text-orange-600">Total branch locations</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {loading ? "..." : totalBranches}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Success and activity rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-green-800">Success Rate</div>
                    <div className="text-xs text-green-600">Course completion percentage</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? "..." : totalStudents > 0 ? `${Math.round((passOutStudents / totalStudents) * 100)}%` : "0%"}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-indigo-800">Active Course Rate</div>
                    <div className="text-xs text-indigo-600">Currently offered courses</div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {loading ? "..." : totalCourses > 0 ? `${Math.round((activeCourses / totalCourses) * 100)}%` : "0%"}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-emerald-800">Active Branch Rate</div>
                    <div className="text-xs text-emerald-600">Currently operating branches</div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {loading ? "..." : totalBranches > 0 ? `${Math.round((activeBranches / totalBranches) * 100)}%` : "0%"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
