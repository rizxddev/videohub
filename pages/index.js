import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">VideoHub</h1>
        <div className="flex gap-4">
          <Link href="/upload" className="bg-blue-500 text-white px-4 py-2 rounded">Upload</Link>
          <Link href="/login" className="bg-gray-200 px-4 py-2 rounded">Login</Link>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search videos..."
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {["Video A", "Video B", "Video C"].map((title, i) => (
          <div key={i} className="bg-white rounded shadow hover:shadow-lg transition">
            <img src={`https://placehold.co/400x200?text=${title}`} alt={title} className="rounded-t" />
            <div className="p-2">
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-gray-500">Uploader</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
