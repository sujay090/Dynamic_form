"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { certificateService, type CertificateEligibleStudent } from '@/API/services/certificateService';
import { toast } from 'sonner';
import {
    Search,
    Award,
    CreditCard,
    Users,
    GraduationCap,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Filter
} from 'lucide-react';

export default function CertificateManagement() {
    const [students, setStudents] = useState<CertificateEligibleStudent[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<CertificateEligibleStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'completed' | 'active'>('all');
    const [generatingIdCard, setGeneratingIdCard] = useState<string | null>(null);
    const [generatingCertificate, setGeneratingCertificate] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        canGetIdCard: 0,
        canGetCertificate: 0
    });

    // Fetch students data
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await certificateService.getCertificateEligibleStudents(filterType);
            setStudents(response.students);
            setFilteredStudents(response.students);

            // Calculate stats
            const newStats = {
                total: response.students.length,
                active: response.students.filter(s => s.isActive).length,
                completed: response.students.filter(s => s.completedCourse).length,
                canGetIdCard: response.students.filter(s => s.canGenerateIdCard).length,
                canGetCertificate: response.students.filter(s => s.canGenerateCertificate).length
            };
            setStats(newStats);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    // Search and filter students
    useEffect(() => {
        let filtered = students;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.phone.includes(searchTerm)
            );
        }

        setFilteredStudents(filtered);
    }, [searchTerm, students]);

    // Load data on mount and filter change
    useEffect(() => {
        fetchStudents();
    }, [filterType]);

    // Generate ID Card
    const handleGenerateIdCard = async (student: CertificateEligibleStudent) => {
        try {
            setGeneratingIdCard(student._id);
            await certificateService.generateStudentIdCard(student._id);
            toast.success(`ID Card generated for ${student.name}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate ID card');
        } finally {
            setGeneratingIdCard(null);
        }
    };

    // Generate Certificate
    const handleGenerateCertificate = async (student: CertificateEligibleStudent) => {
        try {
            setGeneratingCertificate(student._id);
            await certificateService.generateCourseCertificate(student._id);
            toast.success(`Certificate generated for ${student.name}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate certificate');
        } finally {
            setGeneratingCertificate(null);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Certificate Management</h1>
                <p className="text-muted-foreground">
                    Generate student ID cards and course completion certificates
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Total Students</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium">ID Cards</p>
                                <p className="text-2xl font-bold">{stats.canGetIdCard}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium">Certificates</p>
                                <p className="text-2xl font-bold">{stats.canGetCertificate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by name, registration, course, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <Select value={filterType} onValueChange={(value: 'all' | 'completed' | 'active') => setFilterType(value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students</SelectItem>
                                    <SelectItem value="active">Active Only</SelectItem>
                                    <SelectItem value="completed">Completed Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={fetchStudents} variant="outline">
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Students ({filteredStudents.length})
                    </CardTitle>
                    <CardDescription>
                        Manage student ID cards and certificates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No students found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredStudents.map((student) => (
                                <div key={student._id} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                                        {/* Student Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-semibold">{student.name}</h3>
                                                <div className="flex space-x-2">
                                                    {student.isActive && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    )}
                                                    {student.isRegistered && (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                            <Users className="h-3 w-3 mr-1" />
                                                            Registered
                                                        </Badge>
                                                    )}
                                                    {student.completedCourse && (
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                            <GraduationCap className="h-3 w-3 mr-1" />
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <strong>Reg No:</strong> {student.registrationNumber}
                                                </div>
                                                <div>
                                                    <strong>Course:</strong> {student.course}
                                                </div>
                                                <div>
                                                    <strong>Phone:</strong> {student.phone}
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                <strong>Enrolled:</strong> {formatDate(student.createdAt)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                            {/* ID Card Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleGenerateIdCard(student)}
                                                disabled={generatingIdCard === student._id || !student.canGenerateIdCard}
                                                className="flex items-center space-x-2"
                                            >
                                                {generatingIdCard === student._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                ) : (
                                                    <CreditCard className="h-4 w-4" />
                                                )}
                                                <span>ID Card</span>
                                            </Button>

                                            {/* Certificate Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleGenerateCertificate(student)}
                                                disabled={generatingCertificate === student._id || !student.canGenerateCertificate}
                                                className="flex items-center space-x-2"
                                            >
                                                {generatingCertificate === student._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                                ) : (
                                                    <Award className="h-4 w-4" />
                                                )}
                                                <span>Certificate</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Status indicators */}
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs">
                                        <div className="flex space-x-4">
                                            <span className={`flex items-center space-x-1 ${student.canGenerateIdCard ? 'text-green-600' : 'text-gray-400'}`}>
                                                {student.canGenerateIdCard ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                <span>ID Card Available</span>
                                            </span>
                                            <span className={`flex items-center space-x-1 ${student.canGenerateCertificate ? 'text-green-600' : 'text-gray-400'}`}>
                                                {student.canGenerateCertificate ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                <span>Certificate {student.canGenerateCertificate ? 'Available' : 'Pending'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
