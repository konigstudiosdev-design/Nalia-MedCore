import React from 'react';
import { BarChart3, TrendingUp, Users, Download, Calendar } from 'lucide-react';

export function ReportsView() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Reportes</h1>
          <p className="text-zinc-500 font-medium">Análisis detallado de tu práctica clínica</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <Calendar size={18}/> Este Mes
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <Download size={18}/> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportSummaryCard
          title="Productividad"
          value="0%"
          description="Ocupación de agenda este mes"
          icon={<TrendingUp className="text-indigo-500"/>}
        />
        <ReportSummaryCard
          title="Pacientes Nuevos"
          value="0"
          description="Nuevos ingresos este mes"
          icon={<Users className="text-emerald-500"/>}
        />
        <ReportSummaryCard
          title="Ticket Promedio"
          value="$0"
          description="Ingreso medio por consulta"
          icon={<BarChart3 className="text-amber-500"/>}
        />
      </div>

      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <BarChart3 size={48} className="text-zinc-300" />
        </div>
        <h3 className="text-xl font-bold mb-2">Generando Visualizaciones</h3>
        <p className="text-zinc-500 text-center max-w-sm">Los gráficos de rendimiento se actualizarán automáticamente a medida que registres más actividad en el sistema.</p>
      </div>
    </div>
  );
}

function ReportSummaryCard({ title, value, description, icon }: any) {
  return (
    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-black mb-1">{value}</h3>
      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-1">{title}</p>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}
