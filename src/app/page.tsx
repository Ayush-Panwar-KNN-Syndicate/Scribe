import { redirect } from 'next/navigation'

// Root page redirects to articles dashboard
export default function HomePage() {
  redirect('/articles')
}
