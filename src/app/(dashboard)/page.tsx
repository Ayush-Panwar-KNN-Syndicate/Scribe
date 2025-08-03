import { redirect } from 'next/navigation'

// Temporary redirect to bypass build issues
export default function DashboardPage() {
  redirect('/articles')
} 
 
 
 
 