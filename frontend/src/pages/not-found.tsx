import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6 pt-0 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4 mt-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404 Page Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <a className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 w-full">
              Return to Home
            </a>
          </Link>
        </div>
      </Card>
    </div>
  );
}
