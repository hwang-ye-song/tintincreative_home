import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { devLog } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const EmptyPage = () => {
  const navigate = useNavigate();

  // 팝업 설정 가져오기
  const { data: popupData, isLoading } = useQuery({
    queryKey: ["popupSettings"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("popup_settings")
          .select("*")
          .eq("id", "main")
          .maybeSingle();
        
        if (error) {
          if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("406")) {
            devLog.warn("Popup settings table does not exist:", error);
            return null;
          }
          devLog.error("Error fetching popup settings:", error);
          return null;
        }
        
        return data as any;
      } catch (err) {
        devLog.error("Unexpected error fetching popup settings:", err);
        return null;
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Helmet>
          <title>로딩 중... - 틴틴 AI 로봇 아카데미</title>
        </Helmet>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!popupData || !popupData.image_url) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Helmet>
          <title>팝업 정보 없음 - 틴틴 AI 로봇 아카데미</title>
        </Helmet>
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">표시할 팝업 이미지가 없습니다.</p>
          <Button onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            홈페이지로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Helmet>
        <title>팝업 상세 - 틴틴 AI 로봇 아카데미</title>
      </Helmet>
      
      <div className="max-w-4xl w-full">
        {/* 이미지 */}
        <div className="w-full overflow-hidden bg-background rounded-lg shadow-lg mb-4">
          <img 
            src={popupData.image_url} 
            alt={popupData.title || "팝업 이미지"}
            className="w-full h-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 홈페이지로 돌아가기 버튼 */}
        <div className="text-center">
          <Button onClick={() => navigate("/")} size="lg">
            <Home className="mr-2 h-4 w-4" />
            홈페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;

