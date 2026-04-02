import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Loader2, ArrowLeft, File, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { TeachingMaterialFile } from "@/types";

const CURRICULUM_CATEGORIES = [
  "AI 기초",
  "AI 활용",
  "로봇",
  "Canva AI",
  "AI Python",
  "기타",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file

const CreateMaterial = () => {
  const navigate = useNavigate();
  const { user, isAdminOrTeacher, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [curriculumCategory, setCurriculumCategory] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  // 권한 체크
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error("로그인이 필요합니다.");
        navigate("/login", { replace: true });
        return;
      }
      if (!isAdminOrTeacher) {
        toast.error("선생님 또는 관리자만 접근 가능합니다.");
        navigate("/portfolio", { replace: true });
      }
    }
  }, [user, isAdminOrTeacher, isLoading, navigate]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📊";
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return "📈";
    if (fileType.includes("document") || fileType.includes("word")) return "📝";
    if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️";
    return "📁";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      newFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: 파일 크기가 너무 큽니다. (50MB 이하만 가능)`);
          return;
        }
        validFiles.push(file);
      });

      setAttachmentFiles((prev) => [...prev, ...validFiles]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!curriculumCategory) {
      toast.error("커리큘럼 카테고리를 선택해주세요.");
      return;
    }
    if (attachmentFiles.length === 0) {
      toast.error("파일을 최소 한 개 이상 업로드해주세요.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("수업자료를 업로드하는 중입니다...");

    try {
      const uploadedFiles: TeachingMaterialFile[] = [];

      for (const file of attachmentFiles) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("teaching-materials")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("teaching-materials").getPublicUrl(uploadData.path);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type,
        });
      }

      const { error: insertError } = await (supabase as any)
        .from("teaching_materials")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          curriculum_category: curriculumCategory,
          file_urls: uploadedFiles,
          user_id: user.id,
          is_hidden: false,
        });

      if (insertError) throw insertError;

      toast.success("수업자료가 성공적으로 등록되었습니다!", { id: toastId });
      navigate("/portfolio?category=수업자료");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "수업자료 등록 중 오류가 발생했습니다.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || !isAdminOrTeacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Helmet>
        <title>수업자료 등록 | 틴틴AI로봇아카데미</title>
      </Helmet>
      <Navbar />

      <div className="container max-w-3xl mx-auto px-4 pt-24">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로 가기
        </Button>

        <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading">수업자료 등록</h1>
                <Badge variant="secondary" className="mt-0.5 text-xs">
                  🔒 선생님/관리자 전용
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground mb-8 text-sm">
              학생들과 공유할 수업자료를 업로드해주세요. PDF, 이미지, 영상 등 다양한 형식이 지원됩니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 커리큘럼 카테고리 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  커리큘럼 카테고리 <span className="text-red-500">*</span>
                </Label>
                <Select value={curriculumCategory} onValueChange={setCurriculumCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {CURRICULUM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  제목 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 1주차 AI 기초 - 머신러닝 개념 정리"
                  maxLength={100}
                  required
                />
              </div>

              {/* 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  설명 <span className="text-muted-foreground font-normal">(선택)</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="자료에 대한 설명이나 학습 목표를 적어주세요."
                  rows={4}
                  className="resize-none"
                  maxLength={1000}
                />
              </div>

              {/* 파일 업로드 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  파일 첨부 <span className="text-red-500">*</span>
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[120px] hover:bg-muted/50 transition-colors cursor-pointer group relative overflow-hidden bg-background"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform relative z-10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium relative z-10">클릭하여 파일 추가</p>
                  <p className="text-xs text-muted-foreground mt-1 relative z-10">
                    PDF, 이미지, 영상, PPT, Word 등 · 파일당 최대 50MB
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.zip,.rar,.hwp"
                />

                {/* 파일 목록 */}
                {attachmentFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      첨부된 파일 ({attachmentFiles.length}개)
                    </p>
                    {attachmentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/60 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xl flex-shrink-0">{getFileIcon(file.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 hover:text-destructive"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[130px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      수업자료 등록
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateMaterial;
