import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/sections/navbar'
import { Footer } from '@/components/sections/footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
