import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, ArrowLeft, File, Video, Trash2, Image as ImageIcon } from "lucide-react";
import { TiptapEditor } from "@/components/TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import imageCompression from "browser-image-compression";
import { ProjectAttachment, Project } from "@/types";
import { convertYouTubeUrlToEmbed, devLog, sanitizeHtml } from "@/lib/utils";
import { validateImageFile, validateAttachmentFile, sanitizeFileName } from "@/lib/fileValidation";

const BASE_CATEGORIES = ["AI 기초", "AI 활용", "로봇", "기타"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;
const IMAGE_QUALITY = 0.8;

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("중등");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadType, setVideoUploadType] = useState<"url" | "file">("url");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);

  const [attachmentPasswords, setAttachmentPasswords] = useState<Record<number, string>>({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [currentAttachments, setCurrentAttachments] = useState<ProjectAttachment[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "로그인 필요",
            description: "프로젝트를 수정하려면 로그인이 필요합니다.",
            variant: "destructive"
          });
          navigate("/login");
          return;
        }

        let userIsAdmin = false;
        let defaultSubCategory = "중등";
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, student_type")
            .eq("id", user.id)
            .single();

          if (!profileError && profile) {
            const p = profile as any;
            userIsAdmin = p.role === "admin" || p.role === "teacher";
            if (p.student_type) defaultSubCategory = p.student_type;
          }
          setIsAdmin(userIsAdmin);
        } catch {
          setIsAdmin(false);
        }

        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        const isOwner = project.user_id === user.id;
        if (!isOwner && !userIsAdmin) {
          toast({
            title: "권한 없음",
            description: "자신의 프로젝트만 수정할 수 있습니다.",
            variant: "destructive"
          });
          navigate("/portfolio");
          return;
        }

        setTitle(project.title);
        setDescription(project.description);
        setCategory(project.category || "");
        setSubCategory((project as any).sub_category || defaultSubCategory);
        setTags(project.tags || []);
        setCurrentImageUrl(project.image_url);
        setVideoUrl((project as Project).video_url || "");
        setCurrentAttachments((project as Project).attachments || []);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "프로젝트를 불러오는데 실패했습니다.";
        toast({
          title: "오류",
          description: errorMessage,
          variant: "destructive"
        });
        navigate("/portfolio");
      } finally {
        setInitialLoading(false);
      }
    };

    loadProject();
  }, [id, navigate, toast]);

  const processImage = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "파일 검증 실패",
        description: validation.error || "이미지 파일이 올바르지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT),
        useWebWorker: true,
        fileType: file.type,
      };

      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);

      toast({
        title: "이미지 선택 완료",
        description: `이미지가 ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB로 최적화되어 선택되었습니다.`,
      });
    } catch (error) {
      devLog.error("Image compression error:", error);
      setImageFile(file);
      toast({
        title: "이미지 선택 완료",
        description: file.name
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else if (file) {
      toast({
        title: "업로드 불가",
        description: "이미지 파일만 드롭해주세요.",
        variant: "destructive"
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const processVideo = (file: File) => {
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast({
        title: "파일 크기 초과",
        description: "동영상은 20MB 이하여야 합니다.",
        variant: "destructive"
      });
      return;
    }
    if (!file.type.startsWith('video/')) {
      toast({
        title: "잘못된 파일 형식",
        description: "동영상 파일만 업로드 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    setVideoFile(file);
    toast({
      title: "동영상 선택 완료",
      description: file.name
    });
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideo(file);
    }
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processVideo(file);
    }
  };

  const processAttachments = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validation = validateAttachmentFile(file);
      if (!validation.isValid) {
        toast({
          title: "파일 검증 실패",
          description: `${file.name}: ${validation.error || "파일이 올바르지 않습니다."}`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const startIdx = attachmentFiles.length;
      setAttachmentFiles(prev => [...prev, ...validFiles]);
      setCurrentFileIndex(startIdx);
      setTempPassword("");
      setPasswordDialogOpen(true);
      toast({
        title: "첨부 파일 추가 완료",
        description: `${validFiles.length}개의 첨부 파일이 추가되었습니다.`
      });
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processAttachments(files);
      e.target.value = "";
    }
  };

  const handleAttachmentDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAttachment(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processAttachments(files);
    }
  };

  const handlePasswordDialogConfirm = (skip: boolean = false) => {
    if (currentFileIndex !== null) {
      if (!skip && tempPassword.trim()) {
        if (tempPassword.length > 4) {
          toast({
            title: "비밀번호 오류",
            description: "비밀번호는 최대 4자리까지 설정할 수 있습니다.",
            variant: "destructive"
          });
          return;
        }
        setAttachmentPasswords({
          ...attachmentPasswords,
          [currentFileIndex]: tempPassword.trim()
        });
      }

      const nextIndex = currentFileIndex + 1;
      if (nextIndex < attachmentFiles.length) {
        setCurrentFileIndex(nextIndex);
        setTempPassword(attachmentPasswords[nextIndex] || "");
      } else {
        setPasswordDialogOpen(false);
        setCurrentFileIndex(null);
        setTempPassword("");
      }
    }
  };

  const handlePasswordDialogSkip = () => {
    handlePasswordDialogConfirm(true);
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
    const newPasswords = { ...attachmentPasswords };
    delete newPasswords[index];
    const reorderedPasswords: Record<number, string> = {};
    Object.keys(newPasswords).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex > index) {
        reorderedPasswords[oldIndex - 1] = newPasswords[oldIndex];
      } else if (oldIndex < index) {
        reorderedPasswords[oldIndex] = newPasswords[oldIndex];
      }
    });
    setAttachmentPasswords(reorderedPasswords);
  };

  const removeCurrentAttachment = (index: number) => {
    setCurrentAttachments(currentAttachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!category || category.trim() === "") {
        toast({
          title: "카테고리 선택 필요",
          description: "프로젝트 카테고리를 선택해주세요.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "프로젝트를 수정하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      let imageUrl = currentImageUrl;

      if (imageFile) {
        const sanitizedName = sanitizeFileName(imageFile.name);
        const fileExt = sanitizedName.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      let newAttachments: ProjectAttachment[] = [...currentAttachments];
      if (attachmentFiles.length > 0) {
        setUploadingAttachments(true);
        try {
          const uploadPromises = attachmentFiles.map(async (file, index) => {
            const sanitizedName = sanitizeFileName(file.name);
            const fileExt = sanitizedName.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('project-files')
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('project-files')
              .getPublicUrl(fileName);

            return {
              name: sanitizedName,
              url: publicUrl,
              size: file.size,
              type: file.type,
              password: attachmentPasswords[index] || undefined
            };
          });

          const uploadedAttachments = await Promise.all(uploadPromises);
          newAttachments = [...currentAttachments, ...uploadedAttachments];
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          throw new Error(`파일 업로드 실패: ${errorMessage}`);
        } finally {
          setUploadingAttachments(false);
        }
      }

      const finalCategory = category === "BEST" ? null : category;
      const finalIsBest = category === "BEST" ? true : undefined;

      let processedVideoUrl = videoUrl;

      if (videoUploadType === "file" && videoFile) {
        setUploadingAttachments(true);
        try {
          const sanitizedName = sanitizeFileName(videoFile.name);
          const fileExt = sanitizedName.split('.').pop();
          const fileName = `${user.id}/video_${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(fileName, videoFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('project-files')
            .getPublicUrl(fileName);

          processedVideoUrl = publicUrl;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '동영상 업로드 중 오류가 발생했습니다.';
          throw new Error(`동영상 업로드 실패: ${errorMessage}`);
        } finally {
          setUploadingAttachments(false);
        }
      } else if (videoUploadType === "url") {
        processedVideoUrl = videoUrl.trim() ? convertYouTubeUrlToEmbed(videoUrl.trim()) : null;
      } else if (videoUploadType === "file" && !videoFile) {
        processedVideoUrl = videoUrl;
      }

      const updateData: {
        title: string;
        description: string;
        category: string | null;
        sub_category: string;
        tags: string[];
        image_url?: string;
        video_url?: string | null;
        attachments?: ProjectAttachment[];
        is_best?: boolean;
      } = {
        title,
        description,
        category: finalCategory,
        sub_category: subCategory,
        tags,
        image_url: imageUrl,
        video_url: processedVideoUrl,
        attachments: newAttachments.length > 0 ? newAttachments : null,
      };

      if (finalIsBest !== undefined) {
        updateData.is_best = finalIsBest;
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "프로젝트 수정 완료",
        description: "프로젝트가 성공적으로 수정되었습니다."
      });

      navigate(`/portfolio/${id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 수정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/portfolio/${id}`)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">프로젝트 수정</h1>
              <p className="text-sm text-muted-foreground">프로젝트의 상세 정보를 수정해주세요</p>
            </div>
          </div>

          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="editor">편집</TabsTrigger>
              <TabsTrigger value="preview">미리보기</TabsTrigger>
            </TabsList>

            <TabsContent value="editor">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">프로젝트 제목 *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="프로젝트 제목을 입력하세요"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-base font-semibold">카테고리 *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {(isAdmin ? ["BEST", ...BASE_CATEGORIES] : BASE_CATEGORIES).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subCategory" className="text-base font-semibold">소속 선택 (초등/중등/일반)</Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="소속 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="초등">초등</SelectItem>
                        <SelectItem value="중등">중등</SelectItem>
                        <SelectItem value="일반">일반</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-base font-semibold">사용 기술 태그</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="태그를 입력하고 Enter 또는 추가 버튼을 누르세요"
                        />
                        <Button type="button" onClick={addTag} size="icon" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 pl-3 pr-2 py-1"
                            >
                              {tag}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">프로젝트 대표 이미지 (최대 10MB)</Label>
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImage(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingImage(false); }}
                      onDrop={handleImageDrop}
                      className={`mt-2 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[120px] transition-all duration-200 cursor-pointer group relative overflow-hidden
                        ${isDraggingImage ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/50 bg-background"}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all relative z-10
                        ${isDraggingImage ? "bg-primary/20 scale-110" : "bg-primary/10 group-hover:scale-110"}`}>
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium relative z-10">
                        {isDraggingImage ? "여기에 사진을 놓으세요 🖼️" : "클릭하거나 사진을 드래그하여 교체"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 relative z-10">이미지 파일 지원, 자동 압축 적용</p>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imageFile && (
                      <p className="text-sm text-primary font-medium mt-2 animate-fade-in flex items-center gap-1">
                        <Badge variant="outline" className="border-primary text-primary">선택됨</Badge> {imageFile.name}
                      </p>
                    )}
                    {!imageFile && currentImageUrl && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> 기존 프로젝트 이미지 사용 중
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-semibold block mb-2">영상 (선택사항)</Label>
                    <Tabs value={videoUploadType} onValueChange={(v) => setVideoUploadType(v as "url" | "file")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="url">URL 링크 입력</TabsTrigger>
                        <TabsTrigger value="file">동영상 직접 업로드</TabsTrigger>
                      </TabsList>
                      <TabsContent value="url" className="mt-0 space-y-2">
                        <Input
                          id="videoUrl"
                          type="url"
                          value={videoUrl}
                          onChange={handleVideoUrlChange}
                          placeholder="YouTube, Vimeo 등의 영상 URL을 입력하세요"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          YouTube, Vimeo 등의 공유 링크를 입력하세요
                        </p>
                        {videoUrl && !videoUrl.includes('youtube') && !videoUrl.includes('youtu.be') && videoUrl.includes('supabase') && (
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Video className="w-3 h-3" /> 현재 동영상 파일이 설정되어 있습니다. URL을 변경하거나 파일 탭에서 새 파일을 업로드하여 교체할 수 있습니다.
                          </p>
                        )}
                      </TabsContent>
                      <TabsContent value="file" className="mt-0 space-y-2">
                        <div
                          onClick={() => videoInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVideo(true); }}
                          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVideo(false); }}
                          onDrop={handleVideoDrop}
                          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[100px] transition-all duration-200 cursor-pointer group relative overflow-hidden
                            ${isDraggingVideo ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50 bg-background"}`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 relative z-10
                            ${isDraggingVideo ? "bg-primary/20" : "bg-primary/10 group-hover:scale-110 transition-transform"}`}>
                            <Video className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium relative z-10">
                            {isDraggingVideo ? "여기에 비디오를 놓으세요 🎬" : "클릭하거나 동영상을 드래그하여 교체"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 relative z-10">최대 20MB 용량</p>
                        </div>
                        <input
                          id="videoFile"
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                        {videoFile && (
                          <div className="flex items-center gap-2 mt-2 bg-muted p-2 rounded-md animate-fade-in">
                            <Video className="h-4 w-4" />
                            <span className="text-sm truncate flex-1">{videoFile.name}</span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(videoFile.size)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoFile(null);
                                if (videoInputRef.current) videoInputRef.current.value = '';
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {!videoFile && videoUrl && videoUrl.includes('supabase') && (
                          <div className="flex items-center gap-2 mt-2 bg-muted p-2 rounded-md">
                            <Video className="h-4 w-4" />
                            <span className="text-sm truncate flex-1">현재 업로드된 동영상 파일 사용 중</span>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div>
                    <Label htmlFor="attachments" className="text-base font-semibold">첨부 파일 (최대 10MB/파일)</Label>
                    <div
                      onClick={() => attachmentInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAttachment(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAttachment(false); }}
                      onDrop={handleAttachmentDrop}
                      className={`mt-2 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[100px] transition-all duration-200 cursor-pointer group relative overflow-hidden
                        ${isDraggingAttachment ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50 bg-background"}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 relative z-10
                        ${isDraggingAttachment ? "bg-primary/20" : "bg-primary/10 group-hover:scale-110 transition-transform"}`}>
                        <File className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium relative z-10">
                        {isDraggingAttachment ? "여기에 파일을 놓으세요 📂" : "클릭하거나 파일을 드래그하여 추가"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 relative z-10">여러 파일 선택 가능, 각 10MB 제한</p>
                    </div>
                    <input
                      id="attachments"
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      onChange={handleAttachmentChange}
                      className="hidden"
                    />
                    {currentAttachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] h-4">기존 파일</Badge> {currentAttachments.length}개
                        </p>
                        {currentAttachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/40 rounded-md border border-border/50"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {attachment.size ? formatFileSize(attachment.size) : ''}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0 hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); removeCurrentAttachment(index); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {attachmentFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-primary font-semibold flex items-center gap-1">
                          <Badge className="text-[10px] h-4 bg-primary/20 text-primary border-none">새 파일</Badge> {attachmentFiles.length}개
                        </p>
                        {attachmentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-primary/5 rounded-md border border-primary/20 animate-fade-in"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="h-4 w-4 flex-shrink-0 text-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatFileSize(file.size)}
                                  {attachmentPasswords[index] && (
                                    <span className="ml-2 text-primary font-bold">🔒 보안 설정됨</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0 hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <Label className="text-base font-semibold mb-2 block">프로젝트 설명 *</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    텍스트 편집 도구를 사용하여 내용을 꾸며보세요
                  </p>

                  <TiptapEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="프로젝트에 대해 자세히 설명해주세요"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/portfolio/${id}`)}
                    disabled={loading}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={loading || uploadingAttachments}>
                    {loading || uploadingAttachments ? "수정 중..." : "프로젝트 수정"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview">
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h2 className="font-heading text-2xl font-bold">{title || "제목 없음"}</h2>

                  {category && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {category}
                    </Badge>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) || "<p class='text-muted-foreground'>내용 없음</p>" }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 비밀번호 설정 다이얼로그 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 비밀번호 설정</DialogTitle>
            <DialogDescription>
              {currentFileIndex !== null && attachmentFiles[currentFileIndex] && (
                <>
                  파일: <strong>{attachmentFiles[currentFileIndex].name}</strong>
                  <br />
                  비밀번호를 설정하면 다운로드 시 비밀번호가 필요합니다. (최대 4자리)
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="password">비밀번호 (선택사항, 최대 4자리)</Label>
              <Input
                id="password"
                type="text"
                maxLength={4}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="비밀번호 입력 (최대 4자리)"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordDialogSkip}
            >
              그냥 업로드
            </Button>
            <Button
              type="button"
              onClick={() => handlePasswordDialogConfirm(false)}
            >
              비밀번호 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EditProject;
