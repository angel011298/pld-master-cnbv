// Archivo: src/app/foro/page.tsx
"use client"

import * as React from "react"
import { Search, Flame, MessageSquare, ArrowBigUp, Bot, PlusCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/hooks/useUserProfile"

export default function ForoPage() {
  const { profile } = useUserProfile()
  const [search, setSearch] = React.useState("")
  
  // Mocks para ilustrar el Frontend (Conectar con Supabase select(*) from forum_posts en producción)
  const posts = [
    {
      id: 1,
      title: "¿Alguien sabe el umbral exacto para reportar compra de inmuebles?",
      content: "Estoy leyendo la Ley Antilavado pero me confunde si son UMAs vigentes o del momento de la operación.",
      author: { name: "Carlos M.", badge: "⭐ Premium" },
      tags: ["#Dudas_CENEVAL", "#Ley_Antilavado"],
      upvotes: 12,
      replies: 3,
      hasBotReply: true,
      isSolved: true
    },
    {
      id: 2,
      title: "Tipología: Préstamos estructurados en SOFOMES",
      content: "Quiero abrir un debate sobre cómo identificar...",
      author: { name: "Ana P.", badge: "🏆 Nivel 15" },
      tags: ["#Casos_Prácticos", "#Sofipos"],
      upvotes: 8,
      replies: 1,
      hasBotReply: true,
      isSolved: false
    }
  ]

  const handleUpvote = (id: number) => {
    // Aquí llamas a supabase para actualizar upvotes y sumarle +5XP al autor de la respuesta
    alert("+5 XP otorgados al autor por la buena respuesta!")
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Cabecera del Foro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            Comunidad PLD <Flame className="h-6 w-6 text-orange-500" />
          </h1>
          <p className="text-slate-500 font-medium">Resuelve casos prácticos y debate con expertos.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex gap-2">
          <PlusCircle className="h-4 w-4" /> Crear Discusión
        </Button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por artículo, ley, duda..." 
            className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["🔥 Populares", "💬 Sin Respuesta", "Mis Dudas"].map(filter => (
            <button key={filter} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm whitespace-nowrap hover:bg-slate-200 transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Feed de Publicaciones */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex gap-4 hover:border-blue-300 transition-colors cursor-pointer group">
            
            {/* Votación */}
            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
              <button onClick={() => handleUpvote(post.id)} className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600 transition-colors">
                <ArrowBigUp className="h-7 w-7" />
              </button>
              <span className="font-black text-slate-700">{post.upvotes}</span>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-md">{tag}</span>
                ))}
                {post.isSolved && (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-md flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Resuelto
                  </span>
                )}
              </div>
              
              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 line-clamp-1 mb-3">{post.content}</p>
              
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <div className="h-5 w-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px]">👤</div>
                  {post.author.name} <span className="text-amber-600">{post.author.badge}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" /> {post.replies} Respuestas
                </div>
                {post.hasBotReply && (
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Bot className="h-3.5 w-3.5" /> IA Respondió
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}