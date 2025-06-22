export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Visualizações por Dia</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-full bg-gray-700/50 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="h-full w-full flex items-end px-4">
                <div className="h-[20%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
                <div className="h-[35%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
                <div className="h-[25%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
                <div className="h-[40%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
                <div className="h-[60%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
                <div className="h-[45%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
                <div className="h-[70%] w-8 bg-cyan-500/80 rounded-t-sm mx-1"></div>
              </div>
            </div>
            <div className="z-10 text-gray-400 text-sm">Visualizações diárias dos sites clonados</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Países de Origem</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-full bg-gray-700/50 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="h-full w-full flex justify-center items-center">
                <div className="w-40 h-40 rounded-full bg-gray-600 relative">
                  <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-cyan-500 rounded-full transform rotate-45"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-b-cyan-300 rounded-full transform rotate-45"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-l-blue-500 rounded-full transform rotate-45"></div>
                </div>
              </div>
            </div>
            <div className="z-10 text-gray-400 text-sm">Distribuição por países</div>
          </div>
        </div>
      </div>
    </div>
  )
}
