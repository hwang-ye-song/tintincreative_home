import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { devLog } from "@/lib/utils";
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
import AINativeWebMasterClass from "./pages/AINativeWebMasterClass";
import AINativeWebMasterClass3 from "./pages/AINativeWebMasterClass3";
import OMOR1miniMasterClass from "./pages/OMOR1miniMasterClass";
import ChatbotMasterClass from "./pages/ChatbotMasterClass";
import AIPythonMasterClass from "./pages/AIPythonMasterClass";
import AICEMasterClass from "./pages/AICEMasterClass";
import ComputerVisionMasterClass from "./pages/ComputerVisionMasterClass";
import RobotArmMasterClass from "./pages/RobotArmMasterClass";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import PartialPayment from "./pages/PartialPayment";
import EmptyPage from "./pages/EmptyPage";
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

      // 해시가 없으면 처리하지 않음 (무한 루프 방지)
      if (!window.location.hash) {
        return;
      }

      if (error) {
        devLog.error('OAuth error:', error, errorDescription);
        // URL 정리
        window.history.replaceState({}, document.title, window.location.pathname);
        // 에러가 있으면 로그인 페이지로 리다이렉트
        navigate('/login');
        return;
      }

      if (accessToken) {
        // Supabase가 자동으로 세션을 처리하므로 잠시 대기
        try {
          // 세션이 설정될 때까지 대기
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            devLog.error('Session error:', sessionError);
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/login');
            return;
          }

          // URL에서 토큰 파라미터 제거
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );

          // 홈으로 리다이렉트 (리로드하지 않고 navigate만 사용)
          navigate('/', { replace: true });
        } catch (err) {
          devLog.error('OAuth callback handling error:', err);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/');
        }
      }
    };

    // 해시가 있을 때만 실행
    if (window.location.hash) {
      handleOAuthCallback();
    }
  }, [navigate, location.hash]);

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
            <Route path="/curriculum/application-2" element={<ComputerVisionMasterClass />} />
            <Route path="/curriculum/application-3" element={<AINativeWebMasterClass3 />} />
            <Route path="/curriculum/application-4" element={<ChatbotMasterClass />} />
            <Route path="/curriculum/robot" element={<OMOR1miniMasterClass />} />
            <Route path="/curriculum/robot-2" element={<RobotArmMasterClass />} />
            <Route path="/curriculum/basic-2" element={<AIPythonMasterClass />} />
            <Route path="/curriculum/basic" element={<AICEMasterClass />} />
            <Route path="/curriculum/:id" element={<CurriculumDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/create" element={<CreateProject />} />
            <Route path="/portfolio/edit/:id" element={<EditProject />} />
            <Route path="/portfolio/:id" element={<ProjectDetailPage />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/payment/partial" element={<PartialPayment />} />
            <Route path="/empty" element={<EmptyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
