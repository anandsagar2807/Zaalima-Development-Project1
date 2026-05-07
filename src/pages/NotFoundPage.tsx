import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-2xl font-semibold mt-4">Page Not Found</p>
        <p className="text-muted-foreground mt-2">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
