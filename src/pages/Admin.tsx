
import { Navbar } from "@/components/Navbar";
import { LogoUploader } from "@/components/admin/LogoUploader";

const Admin = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Administration</h1>
        <div className="bg-white rounded-lg shadow">
          <LogoUploader />
        </div>
      </main>
    </div>
  );
};

export default Admin;
