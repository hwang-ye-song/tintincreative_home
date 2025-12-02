import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
