// src/app/(authenticated)/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}