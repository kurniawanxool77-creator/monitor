import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { AlertTriangle, Home } from "lucide-react";

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Terjadi Kesalahan";
  let message = "Maaf, terjadi kesalahan yang tidak terduga pada aplikasi.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404 - Halaman Tidak Ditemukan";
      message = "Maaf, URL halaman yang Anda tuju tidak tersedia atau rutenya telah diubah.";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
