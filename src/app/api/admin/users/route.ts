import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/lib/security'

// Usamos el SERVICE_ROLE_KEY para brincar el RLS y tener permisos de administrador
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** E-mail del único súper-admin; configurable por variable de entorno */
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "553angelortiz@gmail.com";

/** Verifica que la solicitud provenga del súper-admin autenticado */
async function assertAdmin(req: NextRequest): Promise<boolean> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return false;
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email === SUPER_ADMIN_EMAIL;
}

export async function POST(request: NextRequest) {
  // ── Verificación de administrador ──────────────────────────────────────────
  const isAdmin = await assertAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json()
    const { action, email, password, fullName, userId, status } = body

    // 1. CREAR USUARIO PREMIUM
    if (action === 'create') {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) throw authError

      // Actualizar el perfil recién creado a premium + guardar contraseña inicial
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          tier: 'premium',
          full_name: fullName,
          status: 'active',
          temp_password: password ?? null,   // visible en el panel admin
        })
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

    // 4. GRANT PREMIUM ACCESS — direct, no payment required
    if (action === 'grant_premium') {
      const rawDays = parseInt(body.premiumDays ?? '61', 10)
      const premiumDays = isNaN(rawDays) || rawDays < 1 ? 61 : Math.min(rawDays, 3650)
      const premiumUntil = new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000)
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          tier: 'premium',
          premium_expires_at: premiumUntil.toISOString(),
          premium_source: 'admin_grant',
        })
        .eq('user_id', userId)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // 5. REVOKE PREMIUM ACCESS — downgrade to free immediately
    if (action === 'revoke_premium') {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          tier: 'free',
          premium_expires_at: null,
          premium_source: 'organic',
        })
        .eq('user_id', userId)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error: unknown) {
    console.error('[admin/users] error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}