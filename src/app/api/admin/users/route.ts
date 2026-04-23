import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Usamos el SERVICE_ROLE_KEY para brincar el RLS y tener permisos de administrador
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  try {
    const { action, email, password, fullName, userId, status } = await request.json()

    // 1. CREAR USUARIO PREMIUM
    if (action === 'create') {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) throw authError

      // Actualizar el perfil recién creado a premium
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({ tier: 'premium', full_name: fullName, status: 'active' })
        .eq('user_id', authData.user.id)

      if (profileError) throw profileError

      return NextResponse.json({ success: true, user: authData.user })
    }

    // 2. SUSPENDER / REACTIVAR USUARIO
    if (action === 'update_status') {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ status: status }) // 'active' o 'suspended'
        .eq('user_id', userId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // 3. ELIMINAR USUARIO
    if (action === 'delete') {
      // Eliminar de auth.users también elimina en user_profiles por el "on delete cascade"
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}