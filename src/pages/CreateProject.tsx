import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Eye, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CATEGORIES = ["AI 기초", "AI 활용", "로봇"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CreateProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImageFile(file);
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
          description: "프로젝트를 작성하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      let imageUrl = null;

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

      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          category,
          tags,
          image_url: imageUrl,
          user_id: user.id
        });

      if (insertError) throw insertError;

      toast({
        title: "프로젝트 등록 완료",
        description: "프로젝트가 성공적으로 등록되었습니다."
      });

      navigate("/portfolio");
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로젝트 등록에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">새 프로젝트 작성</h1>
            <p className="text-muted-foreground">프로젝트의 상세 정보를 입력해주세요</p>
          </div>

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
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Label className="text-base font-semibold mb-2 block">프로젝트 설명 * (마크다운 지원)</Label>
              <p className="text-sm text-muted-foreground mb-4">
                마크다운 문법을 사용하여 텍스트를 꾸밀 수 있습니다. (예: **굵게**, *기울임*, # 제목, - 목록 등)
              </p>
              
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="gap-2">
                    <Code className="h-4 w-4" />
                    편집
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    미리보기
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={15}
                    placeholder="프로젝트에 대해 자세히 설명해주세요&#10;&#10;마크다운 사용 예시:&#10;# 큰 제목&#10;## 중간 제목&#10;**굵은 글씨**&#10;*기울임 글씨*&#10;- 목록 항목&#10;[링크](https://example.com)"
                    className="font-mono"
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-[400px] p-4 border border-border rounded-md bg-background/50">
                    {description ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {description}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        설명을 입력하면 여기에 미리보기가 표시됩니다
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
              <Button type="submit" disabled={loading}>
                {loading ? "등록 중..." : "프로젝트 등록"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateProject;
