"use client"

import * as React from "react"
import { Search, Flame, MessageSquare, ArrowBigUp, Bot, PlusCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserProfile } from "@/hooks/useUserProfile"

type ForumPost = {
  id: string | number
  title: string
  content: string
  tags: string[]
  upvotes: number
  replies: number
  hasBotReply: boolean
  createdAt: string
}

export default function ForoPage() {
  const { profile } = useUserProfile()
  const [search, setSearch] = React.useState("")
  const [posts, setPosts] = React.useState<ForumPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showComposer, setShowComposer] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ title: "", content: "", tags: "" })

  const loadPosts = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/forum")
      const data = await res.json()
      setPosts(Array.isArray(data.posts) ? data.posts : [])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const filteredPosts = posts.filter((post) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return [post.title, post.content, post.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query)
  })

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile?.userId) return
    setSaving(true)
    try {
      await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          author_id: profile.userId,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })
      setForm({ title: "", content: "", tags: "" })
      setShowComposer(false)
      await loadPosts()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-black text-slate-900">
            Comunidad PLD <Flame className="h-6 w-6 text-orange-500" />
          </h1>
          <p className="font-medium text-slate-500">Resuelve casos prácticos y debate con expertos.</p>
        </div>
        <Button
          onClick={() => setShowComposer((value) => !value)}
          className="flex gap-2 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" /> Crear Discusión
        </Button>
      </div>

      {showComposer && (
        <form onSubmit={handleCreatePost} className="mb-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Input
            required
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Título de tu discusión"
          />
          <textarea
            required
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            placeholder="Describe tu duda o caso práctico"
            className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
          />
          <Input
            value={form.tags}
            onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            placeholder="Etiquetas separadas por coma"
          />
          <Button type="submit" disabled={saving || !profile?.userId} className="font-bold">
            Publicar discusión
          </Button>
        </form>
      )}

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por artículo, ley, duda..."
            className="h-12 w-full rounded-xl border-transparent bg-slate-50 pl-10 pr-4 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">Cargando publicaciones reales...</div>}

        {!loading && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <h2 className="font-black text-slate-800">Aún no hay discusiones registradas</h2>
            <p className="mt-1 text-sm text-slate-500">Crea la primera publicación para iniciar el foro con datos reales.</p>
          </div>
        )}

        {filteredPosts.map((post) => (
          <div key={post.id} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300">
            <div className="flex min-w-[3rem] flex-col items-center gap-1">
              <button className="rounded p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600" aria-label="Votar publicación">
                <ArrowBigUp className="h-7 w-7" />
              </button>
              <span className="font-black text-slate-700">{post.upvotes}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{tag}</span>
                ))}
                {post.replies > 0 && (
                  <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Con respuestas
                  </span>
                )}
              </div>

              <h2 className="mb-1 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                {post.title}
              </h2>
              <p className="mb-3 line-clamp-2 text-sm text-slate-500">{post.content}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" /> {post.replies} respuestas
                </div>
                {post.hasBotReply && (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                    <Bot className="h-3.5 w-3.5" /> IA respondió
                  </div>
                )}
                <span className="text-slate-400">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString("es-MX") : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
