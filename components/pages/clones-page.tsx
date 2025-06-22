import { CloneTable } from "../clone-table"
import { Globe, Shield, AlertCircle, Search, Filter, Download } from "lucide-react"

export function ClonesPage() {
  const stats = [
    {
      title: "Total de Clones",
      value: "27",
      icon: <Globe size={20} />,
      color: "text-cyan-400",
    },
    {
      title: "Clones Bloqueados",
      value: "15",
      icon: <Shield size={20} />,
      color: "text-green-400",
    },
    {
      title: "Ameaças Ativas",
      value: "12",
      icon: <AlertCircle size={20} />,
      color: "text-red-400",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sites Clonadores</h1>
          <p className="text-gray-400 text-sm">Monitore e gerencie sites que clonaram suas páginas</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center">
            <Download size={16} className="mr-2" />
            Exportar Lista
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-gray-700 ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por domínio ou IP..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 flex items-center">
              <Filter size={16} className="mr-2" />
              Filtros
            </button>
            <select className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-transparent">
        <CloneTable />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg">
        <div className="flex items-center text-sm text-gray-400">
          Mostrando <span className="font-medium mx-1">1</span> a<span className="font-medium mx-1">10</span> de
          <span className="font-medium mx-1">27</span> resultados
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50">
            Anterior
          </button>
          <button className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500">1</button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">2</button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">3</button>
          <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">Próximo</button>
        </div>
      </div>
    </div>
  )
}
