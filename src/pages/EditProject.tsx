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
import { X, Plus, ArrowLeft } from "lucide-react";
import { TiptapEditor } from "@/components/TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import imageCompression from "browser-image-compression";

const CATEGORIES = ["AI 기초", "AI 활용", "로봇"];
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (project.user_id !== user.id) {
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
      } catch (error: any) {
        toast({
          title: "오류",
          description: error.message || "프로젝트를 불러오는데 실패했습니다.",
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
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "파일 크기 초과",
          description: "이미지는 10MB 이하여야 합니다.",
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
        console.error("Image compression error:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      let imageUrl = currentImageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
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

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title,
          description,
          category,
          tags,
          image_url: imageUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "프로젝트 수정 완료",
        description: "프로젝트가 성공적으로 수정되었습니다."
      });

      navigate(`/portfolio/${id}`);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로젝트 수정에 실패했습니다.",
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
                        {CATEGORIES.map((cat) => (
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
                    <Label htmlFor="image" className="text-base font-semibold">프로젝트 이미지 (최대 10MB)</Label>
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
                  <Button type="submit" disabled={loading}>
                    {loading ? "수정 중..." : "프로젝트 수정"}
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
                    dangerouslySetInnerHTML={{ __html: description || "<p class='text-muted-foreground'>내용 없음</p>" }}
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

export default EditProject;
