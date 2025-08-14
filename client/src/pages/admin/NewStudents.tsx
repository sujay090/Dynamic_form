import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Phone, Mail, Download } from 'lucide-react';
import { toast } from 'sonner';
import { contactService } from '@/API/services/contactService';

interface Contact {
    _id: string;
    name: string;
    email: string;
    phone: string;
    courseDescription: string;
    status: 'new' | 'contacted' | 'enrolled' | 'not_interested';
    createdAt: string;
}

const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    enrolled: 'bg-green-100 text-green-800',
    not_interested: 'bg-red-100 text-red-800'
};

const statusLabels = {
    new: 'New',
    contacted: 'Contacted',
    enrolled: 'Enrolled',
    not_interested: 'Not Interested'
};

export default function NewStudents() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await contactService.getAllContacts();
            setContacts(response.contacts || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contactId: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await contactService.deleteContact(contactId);
            toast.success('Contact deleted successfully');
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading contacts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">New Students</h1>
                    <p className="text-gray-600">Contact form submissions from potential students</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Submissions ({filteredContacts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No contacts found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Course Interest</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Submitted</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredContacts.map((contact) => (
                                        <TableRow key={contact._id}>
                                            <TableCell className="font-medium">{contact.name}</TableCell>
                                            <TableCell>{contact.email}</TableCell>
                                            <TableCell>{contact.phone}</TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {contact.courseDescription || 'No specific course mentioned'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[contact.status]}>
                                                    {statusLabels[contact.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(contact.createdAt)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(contact._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
