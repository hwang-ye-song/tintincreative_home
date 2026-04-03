import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { ProjectAttachment } from "@/types";
import { convertYouTubeUrlToEmbed, devLog, sanitizeHtml } from "@/lib/utils";
import { validateImageFile, validateAttachmentFile, sanitizeFileName } from "@/lib/fileValidation";

const BASE_CATEGORIES = ["AI 기초", "AI 활용", "로봇", "기타"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_FILE_SIZE = 20 * 1024 * 1024; // 20MB for videos
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;
const IMAGE_QUALITY = 0.8;

const CreateProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("중등");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const categories = isAdmin ? ["BEST", ...BASE_CATEGORIES] : BASE_CATEGORIES;

  // 관리자 여부 확인
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, student_type")
          .eq("id", user.id)
          .single();

        if (!profileError && profile) {
          const p = profile as any;
          setIsAdmin(p.role === "admin" || p.role === "teacher");
          if (p.student_type) {
            setSubCategory(p.student_type);
          }
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };
    fetchRole();
  }, []);

  const processImages = async (files: File[]) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: "파일 검증 실패",
          description: validation.error || "이미지 파일이 올바르지 않습니다.",
          variant: "destructive"
        });
        continue;
      }
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: Math.max(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT),
          useWebWorker: true,
          fileType: file.type,
        };
        const compressedFile = await imageCompression(file, options);
        validFiles.push(compressedFile);
        newPreviews.push(URL.createObjectURL(compressedFile));
      } catch (error) {
        devLog.error("Image compression error:", error);
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      toast({
        title: "이미지 추가 완료",
        description: `${validFiles.length}개의 이미지가 추가되었습니다.`
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processImages(files);
    e.target.value = "";
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      processImages(files);
    } else {
      toast({
        title: "업로드 불가",
        description: "이미지 파일만 드롭해주세요.",
        variant: "destructive"
      });
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    if (file.size > MAX_VIDEO_FILE_SIZE) {
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
      title: "동영상 추가 완료",
      description: `${file.name} 동영상이 선택되었습니다.`
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
          description: "프로젝트를 작성하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      let imageUrl = null;
      const imageUrlsList: string[] = [];

      if (imageFiles.length > 0) {
        setUploadingAttachments(true);
        try {
          for (const imgFile of imageFiles) {
            const sanitizedName = sanitizeFileName(imgFile.name);
            const fileExt = sanitizedName.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('project-images')
              .upload(fileName, imgFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('project-images')
              .getPublicUrl(fileName);

            imageUrlsList.push(publicUrl);
          }
          imageUrl = imageUrlsList[0] || null;
        } finally {
          setUploadingAttachments(false);
        }
      }

      let attachments: ProjectAttachment[] = [];
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

          attachments = await Promise.all(uploadPromises);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          throw new Error(`파일 업로드 실패: ${errorMessage}`);
        } finally {
          setUploadingAttachments(false);
        }
      }

      if (category === "BEST" && !isAdmin) {
        toast({
          title: "권한 없음",
          description: "BEST 카테고리는 관리자만 지정할 수 있습니다.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const finalCategory = category === "BEST" ? null : category;
      const finalIsBest = category === "BEST" ? true : undefined;

      let processedVideoUrl = null;

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
      } else if (videoUploadType === "url" && videoUrl.trim()) {
        processedVideoUrl = convertYouTubeUrlToEmbed(videoUrl.trim());
      }

      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          category: finalCategory,
          sub_category: subCategory,
          tags,
          image_url: imageUrl,
          image_urls: imageUrlsList.length > 0 ? imageUrlsList : null,
          video_url: processedVideoUrl,
          attachments: attachments.length > 0 ? attachments : null,
          user_id: user.id,
          is_hidden: false,
          is_best: finalIsBest
        } as any);

      if (insertError) throw insertError;

      toast({
        title: "프로젝트 등록 완료",
        description: "프로젝트가 성공적으로 등록되었습니다."
      });

      navigate("/portfolio");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 등록에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/portfolio")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">새 프로젝트 작성</h1>
              <p className="text-sm text-muted-foreground">프로젝트의 상세 정보를 입력해주세요</p>
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
                  {/* ... (제목, 카테고리, 소속 선택, 태그 입력 부분은 동일함) ... */}
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
                        {categories.map((cat) => (
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
                    <Label className="text-base font-semibold">프로젝트 이미지 (여러 장 가능, 파일당 최대 10MB)</Label>
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
                        {isDraggingImage ? "여기에 사진을 놓으세요 🖼️" : "클릭하거나 사진을 드래그하여 추가"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 relative z-10">이미지 여러 장 지원, 자동 압축 적용</p>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreviews.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group animate-fade-in">
                            <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded-sm">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
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
                            {isDraggingVideo ? "여기에 비디오를 놓으세요 🎬" : "클릭하거나 동영상을 드래그하여 추가"}
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
                    {attachmentFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachmentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-md animate-fade-in"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                  {attachmentPasswords[index] && (
                                    <span className="ml-2 text-primary">🔒 비밀번호 설정됨</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                    onClick={() => navigate("/portfolio")}
                    disabled={loading}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={loading || uploadingAttachments}>
                    {loading || uploadingAttachments ? "등록 중..." : "프로젝트 등록"}
                  </Button>
                </div>
              </form>
            </TabsContent>

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

      <Footer />
    </div>
  );
};

export default CreateProject;
