import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Trash2,
  BookOpen,
  Loader2,
  FileText,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { TeachingMaterial, TeachingMaterialFile } from "@/types";
import { Helmet } from "react-helmet-async";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORY_COLORS: Record<string, string> = {
  "AI 기초": "bg-blue-100 text-blue-700 border-blue-200",
  "AI 활용": "bg-purple-100 text-purple-700 border-purple-200",
  "로봇": "bg-orange-100 text-orange-700 border-orange-200",
  "Canva AI": "bg-pink-100 text-pink-700 border-pink-200",
  "AI Python": "bg-green-100 text-green-700 border-green-200",
  "기타": "bg-gray-100 text-gray-700 border-gray-200",
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (fileType?: string) => {
  if (!fileType) return "📁";
  if (fileType.includes("image")) return "🖼️";
  if (fileType.includes("video")) return "🎬";
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📊";
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📈";
  if (fileType.includes("document") || fileType.includes("word")) return "📝";
  if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️";
  return "📁";
};

const MaterialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminOrTeacher } = useAuth();

  const [material, setMaterial] = useState<TeachingMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("teaching_materials")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setMaterial(data as TeachingMaterial);
      } catch (error: any) {
        toast({
          title: "오류",
          description: "수업자료를 불러올 수 없습니다.",
          variant: "destructive",
        });
        navigate("/portfolio?category=수업자료");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from("teaching_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "수업자료가 삭제되었습니다.",
      });
      navigate("/portfolio?category=수업자료");
    } catch (error: any) {
      toast({
        title: "오류",
        description: "삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!material) return null;

  const fileList = Array.isArray(material.file_urls) ? material.file_urls : [];
  const categoryColor = CATEGORY_COLORS[material.curriculum_category] || CATEGORY_COLORS["기타"];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{material.title} - 수업자료</title>
        <meta name="description" content={material.description || material.title} />
      </Helmet>
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* 상단 버튼 바 */}
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/portfolio?category=수업자료")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>
            {isAdminOrTeacher && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            )}
          </div>

          {/* 메인 카드 */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-blue-500/5 p-6 md:p-8 border-b">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium border ${categoryColor}`}
                    >
                      {material.curriculum_category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      🔒 수업자료
                    </Badge>
                  </div>
                  <h1 className="font-heading text-xl md:text-2xl font-bold">{material.title}</h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(material.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                    {material.profiles?.name && (
                      <>
                        <span>·</span>
                        <span>{material.profiles.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 설명 */}
            {material.description && (
              <div className="p-6 border-b">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {material.description}
                </p>
              </div>
            )}

            {/* 파일 목록 */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">
                  첨부 파일 ({fileList.length}개)
                </h2>
              </div>

              {fileList.length === 0 ? (
                <p className="text-sm text-muted-foreground">첨부 파일이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {fileList.map((file: TeachingMaterialFile, index: number) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.name}
                      className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-xl border border-transparent hover:border-border transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.size ? formatFileSize(file.size) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors hidden sm:block">
                          다운로드
                        </span>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수업자료 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 수업자료를 삭제하시겠습니까? 첨부 파일을 포함하여 모든 데이터가 삭제됩니다.
              이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default MaterialDetailPage;
