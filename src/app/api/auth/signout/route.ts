import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  const log = logger.child({ route: 'auth/signout' });

  try {
    const accessToken = req.cookies.get('token')?.value;

    if (accessToken) {
      // Best effort sign out from Supabase
      await supabaseAdmin.auth.admin.signOut(accessToken).catch(() => null);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

    // Clear cookies
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');

    log.info('User signed out and cookies cleared');
    return response;
  } catch (error: any) {
    log.error({ error: error.message }, 'Signout error');
    const response = NextResponse.json({ success: true, message: 'Signed out' });
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    return response;
  }
}
