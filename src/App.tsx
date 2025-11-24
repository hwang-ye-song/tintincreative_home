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

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
