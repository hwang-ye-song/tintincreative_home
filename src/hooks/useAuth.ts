import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { devLog } from "@/lib/utils";

interface UseAuthReturn {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isAdminOrTeacher: boolean;
}

/**
 * 사용자 인증 상태를 관리하는 커스텀 훅
 * 여러 컴포넌트에서 중복되던 인증 로직을 통합
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // 프로필 조회는 비동기로 처리
        (async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!profileError && profile && 'role' in profile) {
              setUserRole((profile as { role?: string }).role || null);
            } else {
              setUserRole(null);
            }
          } catch {
            setUserRole(null);
          }
        })();
      } catch (error) {
        devLog.error('User check error:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session || !session.user) {
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }
        
        setUser(session.user);
        setIsLoading(false);
        
        // 프로필 조회는 비동기로 처리
        (async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!profileError && profile && 'role' in profile) {
              setUserRole((profile as { role?: string }).role || null);
            } else {
              setUserRole(null);
            }
          } catch {
            setUserRole(null);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = userRole === "admin";
  const isTeacher = userRole === "teacher";
  const isAdminOrTeacher = isAdmin || isTeacher;

  return { user, userRole, isLoading, isAdmin, isTeacher, isAdminOrTeacher };
}

