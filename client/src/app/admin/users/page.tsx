import { UserPlus, Search, Edit2, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const users = [
    { id: "USR-001", name: "Budi Santoso", role: "ADMIN_ROOT", status: "ACTIVE", lastLogin: "2024-05-17 08:30" },
    { id: "USR-002", name: "Siti Rahma", role: "DATA_SCIENTIST", status: "ACTIVE", lastLogin: "2024-05-17 07:15" },
    { id: "USR-003", name: "Andi Wijaya", role: "PETUGAS_LAPANGAN", status: "INACTIVE", lastLogin: "2024-05-15 16:45" },
    { id: "USR-004", name: "Dewi Lestari", role: "PETUGAS_LAPANGAN", status: "ACTIVE", lastLogin: "2024-05-17 06:20" },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Manajemen Pengguna & Akses</h3>
          <p className="text-sm font-mono text-accent-grey">Atur role dan hak akses pengguna sistem.</p>
        </div>
        <button className="bg-foreground text-background font-mono font-bold uppercase px-4 py-3 flex items-center hover:bg-accent-red transition-colors shadow-brutal active:translate-y-1 active:shadow-none">
          <UserPlus size={18} className="mr-2" />
          Tambah Pengguna Baru
        </button>
      </div>

      <div className="bg-white border-2 border-border-color shadow-brutal mb-8">
        <div className="p-4 border-b-2 border-border-color flex justify-between items-center bg-surface">
          <div className="flex border-2 border-border-color bg-white px-3 py-2 items-center w-72">
            <Search size={16} className="text-accent-grey mr-2" />
            <input type="text" placeholder="CARI NAMA / ROLE" className="outline-none text-sm font-mono w-full uppercase placeholder-accent-grey" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface font-mono text-xs uppercase text-accent-grey border-b-2 border-border-color">
                <th className="p-4 font-bold">ID User</th>
                <th className="p-4 font-bold">Nama Pengguna</th>
                <th className="p-4 font-bold">Role Akses</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Login Terakhir</th>
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {users.map((user, idx) => (
                <tr 
                  key={user.id} 
                  className={`border-b border-border-color group hover:bg-surface transition-colors relative ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                  }`}
                >
                  <td className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-foreground transition-colors"></td>
                  
                  <td className="p-4 font-bold">{user.id}</td>
                  <td className="p-4 font-bold">{user.name}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 text-xs font-bold border ${
                      user.role === "ADMIN_ROOT" ? "bg-red-100 border-accent-red text-accent-red" :
                      user.role === "DATA_SCIENTIST" ? "bg-green-100 border-accent-green text-accent-green" :
                      "bg-gray-100 border-foreground text-foreground"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center text-xs font-bold ${user.status === "ACTIVE" ? "text-accent-green" : "text-accent-grey"}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.status === "ACTIVE" ? "bg-accent-green" : "bg-accent-grey"}`}></div>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-accent-grey">{user.lastLogin}</td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button className="p-2 border-2 border-border-color hover:border-foreground hover:bg-foreground hover:text-white transition-colors" title="Edit Pengguna">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 border-2 border-border-color hover:border-accent-red hover:bg-accent-red hover:text-white transition-colors text-accent-red" title="Hapus Pengguna">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
