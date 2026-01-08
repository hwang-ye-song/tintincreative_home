import { useState, useEffect } from "react";
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
import { X, Plus, ArrowLeft, File, Video, Trash2 } from "lucide-react";
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
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

        // 관리자 여부 확인 (먼저 확인)
        let userIsAdmin = false;
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          
          if (!profileError && profile && 'role' in profile) {
            const role = (profile as { role?: string }).role;
            userIsAdmin = role === "admin" || role === "teacher";
          } else {
            userIsAdmin = false;
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

        // 작성자이거나 관리자인지 확인 (isAdmin 상태 대신 변수 사용)
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 검증
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
        // 이미지 압축
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: Math.max(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT),
          useWebWorker: true,
          fileType: file.type,
        };

        const compressedFile = await imageCompression(file, options);
        setImageFile(compressedFile);
        
        toast({
          title: "이미지 최적화 완료",
          description: `이미지가 ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB로 최적화되었습니다.`,
        });
      } catch (error) {
        devLog.error("Image compression error:", error);
        setImageFile(file); // 압축 실패 시 원본 사용
      }
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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // 파일 검증
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
      // 첫 번째 파일에 대해 비밀번호 설정 다이얼로그 표시
      const newFiles = [...attachmentFiles, ...validFiles];
      setAttachmentFiles(newFiles);
      setCurrentFileIndex(attachmentFiles.length); // 새로 추가된 첫 번째 파일 인덱스
      setTempPassword("");
      setPasswordDialogOpen(true);
    }
    
    // input 초기화
    e.target.value = "";
  };

  const handlePasswordDialogConfirm = (skip: boolean = false) => {
    if (currentFileIndex !== null) {
      if (!skip && tempPassword.trim()) {
        // 비밀번호가 4자리 이하인지 확인
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
      
      // 다음 파일이 있으면 계속, 없으면 닫기
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
    // 비밀번호도 함께 제거
    const newPasswords = { ...attachmentPasswords };
    delete newPasswords[index];
    // 인덱스 재정렬
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
      // 카테고리 필수 검증
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

      // Upload new attachments
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

      // BEST 카테고리를 선택한 경우, 카테고리는 null로 설정하고 is_best만 true로 설정
      const finalCategory = category === "BEST" ? null : category;
      const finalIsBest = category === "BEST" ? true : undefined;

      // 유튜브 URL을 embed 형식으로 변환
      const processedVideoUrl = videoUrl.trim() 
        ? convertYouTubeUrlToEmbed(videoUrl.trim())
        : null;

      const updateData: {
        title: string;
        description: string;
        category: string | null;
        tags: string[];
        image_url?: string;
        video_url?: string | null;
        attachments?: ProjectAttachment[];
        is_best?: boolean;
      } = {
        title,
        description,
        category: finalCategory,
        tags,
        image_url: imageUrl,
        video_url: processedVideoUrl,
        attachments: newAttachments.length > 0 ? newAttachments : null,
      };

      // BEST 상태가 변경되는 경우에만 is_best 업데이트
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
                    <Label htmlFor="image" className="text-base font-semibold">프로젝트 대표 이미지 (최대 10MB)</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-2"
                    />
                    {imageFile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        선택됨: {imageFile.name}
                      </p>
                    )}
                    {!imageFile && currentImageUrl && (
                      <p className="text-sm text-muted-foreground mt-2">
                        현재 이미지 사용 중
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="video" className="text-base font-semibold">영상 URL (선택사항)</Label>
                    <Input
                      id="video"
                      type="url"
                      value={videoUrl}
                      onChange={handleVideoUrlChange}
                      placeholder="YouTube, Vimeo 등의 영상 URL을 입력하세요"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      YouTube, Vimeo 등의 공유 링크를 입력하거나 직접 업로드한 영상의 URL을 입력하세요
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="attachments" className="text-base font-semibold">첨부 파일 (최대 10MB/파일)</Label>
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleAttachmentChange}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      여러 파일을 선택할 수 있습니다. 각 파일은 최대 10MB까지 업로드 가능합니다.
                    </p>
                    {currentAttachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">현재 첨부 파일:</p>
                        {currentAttachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.size ? formatFileSize(attachment.size) : ''}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => removeCurrentAttachment(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {attachmentFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">새로 추가할 파일:</p>
                        {attachmentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
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
                              onClick={() => removeAttachment(index)}
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
