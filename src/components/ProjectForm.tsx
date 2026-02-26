import React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AVAILABLE_TAGS = [
  "AI", "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
  "Robotics", "Python", "TensorFlow", "PyTorch", "OpenCV",
  "React", "JavaScript", "Arduino", "Raspberry Pi", "ROS"
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ProjectForm = ({ open, onOpenChange, onSuccess }: ProjectFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("중등");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (open) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('student_type')
            .eq('id', user.id)
            .maybeSingle();

          const p = profile as any;
          if (p?.student_type) {
            setSubCategory(p.student_type);
          }
        }
      }
    };
    fetchProfile();
  }, [open]);

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
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
        return;
      }

      let imageUrl = null;

      // Upload image if selected
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

      // Insert project
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          category,
          sub_category: subCategory,
          tags: selectedTags,
          image_url: imageUrl,
          user_id: user.id
        });

      if (insertError) throw insertError;

      toast({
        title: "프로젝트 등록 완료",
        description: "프로젝트가 성공적으로 등록되었습니다."
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setSubCategory("중등");
      setSelectedTags([]);
      setImageFile(null);
      onOpenChange(false);
      onSuccess();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 프로젝트 등록</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">프로젝트 제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="프로젝트 제목을 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: AI, 로봇공학, 컴퓨터 비전"
            />
          </div>

          <div>
            <Label htmlFor="subCategory">소속 (초/중/일반)</Label>
            <Select value={subCategory} onValueChange={setSubCategory}>
              <SelectTrigger id="subCategory">
                <SelectValue placeholder="소속 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="초등">초등</SelectItem>
                <SelectItem value="중등">중등</SelectItem>
                <SelectItem value="일반">일반</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">프로젝트 설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="프로젝트에 대해 자세히 설명해주세요"
            />
          </div>

          <div>
            <Label htmlFor="image">프로젝트 이미지 (최대 10MB)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageFile && (
              <p className="text-sm text-muted-foreground mt-1">
                선택됨: {imageFile.name}
              </p>
            )}
          </div>

          <div>
            <Label>사용 기술 태그</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AVAILABLE_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                선택된 태그: {selectedTags.join(", ")}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
