/**
 * Help Center Page
 * 
 * Comprehensive help center with:
 * - Interactive FAQ
 * - Quick start guides
 * - Contextual help links
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HelpCircle,
    FileText,
    Search,
    User,
    Clock,
    MessageCircle,
    Phone,
    Mail
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

// FAQ data
const faqs: FAQItem[] = [
    {
        question: 'How do I register a complaint?',
        answer: 'To register a complaint, log in to your account and click on "Register Complaint" from the dashboard. Fill in the required details including category, description, location, and priority. You can also attach photos to help describe the issue better.',
        category: 'General'
    },
    {
        question: 'How long does it take to resolve a complaint?',
        answer: 'Resolution time depends on the priority and complexity of the issue. Low priority issues are typically resolved within 48-72 hours, medium priority within 24-48 hours, and high/critical priority issues are addressed immediately.',
        category: 'General'
    },
    {
        question: 'Can I attach photos to my complaint?',
        answer: 'Yes! We highly recommend attaching photos as they help the maintenance team understand the issue better and resolve it faster. You can attach multiple images when filing a complaint.',
        category: 'Filing Complaints'
    },
    {
        question: 'How do I track my complaint status?',
        answer: 'You can track your complaint by going to the "Track Complaint" page and entering your complaint number. You will see the current status, timeline of updates, and assigned staff details.',
        category: 'Tracking'
    },
    {
        question: 'What do the different status mean?',
        answer: 'Pending: Awaiting review | Approved: Accepted by HOD | Assigned: Staff member assigned | In Progress: Work started | On Hold: Temporarily paused | Completed: Issue resolved | Rejected: Not approved',
        category: 'Tracking'
    },
    {
        question: 'How do I contact the assigned staff?',
        answer: 'Once a staff member is assigned, you can view their contact details (phone, email) in the complaint details page. You can also contact them through the Staff Directory.',
        category: 'Communication'
    },
    {
        question: 'What happens if my complaint is not resolved on time?',
        answer: 'Complaints that are not resolved within the SLA timeline are automatically escalated to higher authorities. You will receive notifications about the escalation.',
        category: 'Escalation'
    },
    {
        question: 'Can I cancel or modify a complaint?',
        answer: 'You can add comments to provide additional information to an existing complaint. To cancel or major modifications, please contact the HOD or admin.',
        category: 'Filing Complaints'
    },
    {
        question: 'How do I provide feedback after resolution?',
        answer: 'After your complaint is resolved, you will receive an email asking for feedback. You can also rate the service directly from the complaint tracking page.',
        category: 'Feedback'
    },
    {
        question: 'Who can I contact for urgent issues?',
        answer: 'For urgent/emergency issues, please mark your complaint as "Critical" priority. You can also contact the maintenance helpdesk directly or reach out to your department HOD.',
        category: 'Emergency'
    },
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = faqs.filter(f =>
        searchQuery === '' ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        📚 Help Center
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Find answers to common questions and learn how to use PU Unicare.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 text-lg"
                        />
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
                >
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <FileText className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="font-semibold">File Complaint</p>
                                <p className="text-xs opacity-80">Get started</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Clock className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="font-semibold">Track Status</p>
                                <p className="text-xs opacity-80">Check progress</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-[#1F3F73] to-[#12302F] text-white border-0 cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <User className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="font-semibold">Staff Directory</p>
                                <p className="text-xs opacity-80">Find contacts</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <MessageCircle className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="font-semibold">AI Chatbot</p>
                                <p className="text-xs opacity-80">Get help</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* FAQ Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <HelpCircle className="h-6 w-6 text-primary" />
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-500">Quick answers to common questions</p>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <Accordion type="single" collapsible className="w-full">
                                {filteredFaqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left hover:text-primary">
                                            <div className="flex items-start gap-3">
                                                <Badge variant="outline" className="flex-shrink-0 mt-0.5">
                                                    {faq.category}
                                                </Badge>
                                                <span>{faq.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-600 pl-20">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Contact Support */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-r from-primary/10 to-[#C2A05A]/15 border-0">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Still Need Help?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Our support team is here to assist you
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button className="gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Support
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Phone className="h-4 w-4" />
                                    Call Helpdesk
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Live Chat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>
            </main>

            <Footer />
        </div>
    );
}
