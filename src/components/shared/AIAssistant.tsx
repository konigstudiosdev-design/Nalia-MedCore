import React, { useState } from 'react';
import { Sparkles, Check, Edit3, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

interface AIAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const ACTIONS: AIAction[] = [
  { id: 'summary', label: 'Resumen Clínico', icon: <Sparkles size={16}/>, prompt: 'Generar resumen del historial del paciente...' },
  { id: 'soap', label: 'Borrador SOAP', icon: <Edit3 size={16}/>, prompt: 'Generar borrador de nota SOAP basada en la transcripción...' },
  { id: 'instructions', label: 'Instrucciones', icon: <MessageSquare size={16}/>, prompt: 'Crear instrucciones claras para el paciente...' },
];

interface AIAssistantProps {
  onApply: (content: string, type: string) => void;
  context?: string;
}

export function AIAssistant({ onApply, context }: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleGenerate = (action: AIAction) => {
    setIsGenerating(true);
    setActiveAction(action.id);

    // Simulating AI generation
    setTimeout(() => {
      let content = "";
      if (action.id === 'summary') {
        content = "Paciente masculino de 39 años con Diabetes Tipo 2 controlada. Última visita hace 8 meses. Alérgico a la Penicilina. Estable en su tratamiento con Metformina.";
      } else if (action.id === 'soap') {
        content = "S: El paciente refiere fatiga leve.\nO: TA 120/80, FC 72, Peso 82kg.\nA: Diabetes controlada, ajustar dieta.\nP: Continuar Metformina, cita en 3 meses.";
      } else {
        content = "1. Tomar sus medicamentos a la misma hora.\n2. Incrementar consumo de agua.\n3. Realizar caminata diaria de 30 min.\n4. Evitar azúcares refinados.";
      }
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-indigo-200 dark:border-indigo-900/50 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/10">
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={18} />
          <span className="font-bold text-sm">MedCore AI Assistant</span>
        </div>
        <div className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">Beta</div>
      </div>

      <div className="p-4">
        {!generatedContent && !isGenerating && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 mb-4 font-medium leading-relaxed">
              ¿En qué puedo ayudarte con este paciente? Selecciona una acción para comenzar.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleGenerate(action)}
                  className="flex items-center gap-3 p-3 text-left bg-zinc-50 dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all group"
                >
                  <div className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{action.icon}</div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="text-indigo-500 animate-spin" size={32} />
            <p className="text-sm font-bold text-zinc-500 animate-pulse">Generando respuesta inteligente...</p>
          </div>
        )}

        {generatedContent && !isGenerating && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 p-3 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                Contenido generado por IA. Por favor revise y edite antes de aprobar. El juicio profesional es insustituible.
              </p>
            </div>

            <div className="relative group">
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="w-full h-40 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans leading-relaxed"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setGeneratedContent(null)}
                className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={() => {
                  onApply(generatedContent, activeAction || 'ai');
                  setGeneratedContent(null);
                }}
                className="flex-[2] px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Check size={18} /> Aprobar y Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-zinc-50 dark:bg-[#0A0A0A] px-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-[10px] text-center text-zinc-400 font-medium">
          La IA es una herramienta de apoyo y no sustituye el criterio clínico profesional.
        </p>
      </div>
    </div>
  );
}
