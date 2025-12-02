import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import CurriculumDetail from "./pages/CurriculumDetail";
import Portfolio from "./pages/Portfolio";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import Faculty from "./pages/Faculty";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60초 (더 긴 캐시 유지)
      gcTime: 10 * 60 * 1000, // 10분 (더 긴 가비지 컬렉션 시간)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // 마운트 시 자동 리페치 비활성화 (캐시 우선)
    },
  },
});

// OAuth 콜백 처리 컴포넌트
const OAuthCallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // URL 해시에서 토큰 확인
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        console.error('OAuth error:', error, errorDescription);
        // 에러가 있으면 로그인 페이지로 리다이렉트
        navigate('/login');
        return;
      }

      if (accessToken) {
        // Supabase가 자동으로 세션을 처리하지만, URL 정리를 위해 세션 확인
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
          }

          // URL에서 토큰 파라미터 제거
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );

          // 홈으로 리다이렉트 (이미 홈이면 리로드)
          if (window.location.pathname === '/') {
            window.location.reload();
          } else {
            navigate('/');
          }
        } catch (err) {
          console.error('OAuth callback handling error:', err);
          navigate('/');
        }
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <OAuthCallbackHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/curriculum/:id" element={<CurriculumDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/create" element={<CreateProject />} />
            <Route path="/portfolio/edit/:id" element={<EditProject />} />
            <Route path="/portfolio/:id" element={<ProjectDetailPage />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
