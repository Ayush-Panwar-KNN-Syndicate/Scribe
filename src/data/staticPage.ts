
import { Home, Search, BookOpen, Info, Phone, Shield, FileText } from "lucide-react";

export const pages = [
    {
        id: 'homepage',
        title: 'Homepage',
        description: 'Main landing page with hero section, featured articles, and site statistics',
        icon: Home,
        features: ['Hero Section', 'Featured Articles Grid', 'Site Statistics', 'SEO Optimized']
    },
    {
        id: 'search',
        title: 'Search',
        description: 'Professional search interface with real-time results and progressive enhancement',
        icon: Search,
        features: ['Real-time Search', 'Progressive Enhancement', 'AdSense Integration', 'Mobile Optimized']
    },
    {
        id: 'articles',
        title: 'Articles',
        description: 'Comprehensive articles listing page with search functionality and category browsing',
        icon: BookOpen,
        features: ['Article Search', 'Category Browse', 'Featured Articles', 'Responsive Grid']
    },
    {
        id: 'about',
        title: 'About Us',
        description: 'Professional about page with team, mission, values, and company story',
        icon: Info,
        features: ['Mission & Story', 'Team Profiles', 'Company Values', 'Community Section']
    },
    {
        id: 'contact',
        title: 'Contact Us',
        description: 'Professional contact page with form, contact information, and office details',
        icon: Phone,
        features: ['Contact Form', 'Contact Information', 'Office Location', 'Structured Data']
    },
    {
        id: 'privacy',
        title: 'Privacy Policy',
        description: 'Comprehensive privacy policy with table of contents and legal compliance',
        icon: Shield,
        features: ['Table of Contents', 'GDPR Compliant', 'Legal Sections', 'Contact Information']
    },
    {
        id: 'terms',
        title: 'Terms of Use',
        description: 'Professional terms of service with comprehensive legal sections and user responsibilities',
        icon: FileText,
        features: ['Table of Contents', 'Legal Compliance', 'User Responsibilities', 'Service Terms']
    }
];
