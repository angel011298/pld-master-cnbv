// Archivo: src/app/api/forum/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { proModel } from '@/lib/gemini'; // Tu modelo de IA actual

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from('forum_posts')
      .select(`
        id,
        title,
        content,
        tags,
        upvotes,
        created_at,
        author_id,
        forum_comments(id, is_ai_bot)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      posts: (data ?? []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        tags: Array.isArray(post.tags) ? post.tags : [],
        upvotes: post.upvotes ?? 0,
        createdAt: post.created_at,
        authorId: post.author_id,
        replies: post.forum_comments?.length ?? 0,
        hasBotReply: Boolean(post.forum_comments?.some((comment: any) => comment.is_ai_bot)),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ posts: [], error: error.message }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, author_id, tags } = await request.json();
    const sb = supabaseAdmin();

    // 1. Guardar el Post del Humano
    const { data: post, error: postErr } = await sb.from('forum_posts')
      .insert({ title, content, author_id, tags })
      .select().single();
      
    if (postErr) throw postErr;

    // 2. Generar respuesta con IA en segundo plano (Killer Feature)
    // Extraemos contexto rápido de tu RAG o usamos conocimiento base de Gemini entrenado con CNBV
    const systemPrompt = `
      Eres 'Certifik Bot', el asistente experto en PLD/FT de la comunidad.
      Un alumno ha preguntado en el foro: "${title}". 
      Detalle: "${content}".
      Responde de manera amable, directa, citando leyes mexicanas (CNBV, UIF, LFPIORPI) como si fueras un experto de StackOverflow.
      Formatea tu respuesta con negritas y emojis profesionales.
    `;
    
    const result = await proModel().generateContent(systemPrompt);
    const aiText = await result.response.text();

    // 3. Insertar la respuesta del Bot
    await sb.from('forum_comments').insert({
      post_id: post.id,
      content: aiText,
      is_ai_bot: true,
      author_id: null // Identificador de que es el bot
    });

    return NextResponse.json({ success: true, post });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
