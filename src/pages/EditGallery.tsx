import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Loader2, ArrowLeft, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { ClassGallery } from "@/types";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditGallery = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdminOrTeacher, isLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [uploadType, setUploadType] = useState<"file" | "youtube">("file");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<{ url: string; isVideo: boolean; isOriginal?: boolean }[]>([]);
    const [originalGallery, setOriginalGallery] = useState<ClassGallery | null>(null);

    // 데이터 불러오기 및 권한 체크
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            toast.error("로그인이 필요합니다.");
            navigate("/login", { replace: true });
            return;
        }

        if (!isAdminOrTeacher) {
            toast.error("선생님 또는 관리자만 접근 가능합니다.");
            navigate("/", { replace: true });
            return;
        }

        fetchGalleryData();
    }, [user, isAdminOrTeacher, isLoading, id, navigate]);

    const fetchGalleryData = async () => {
        try {
            if (!id) throw new Error("유효하지 않은 게시물 ID입니다.");

            const { data, error } = await supabase
                .from("class_gallery")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            if (!data) throw new Error("게시물을 찾을 수 없습니다.");

            // 권한 재확인 (선생님 혹은 본인 글인지 등 확인은 데이터베이스 RLS에 위임하거나 기본 검사만 수행)
            if (data.user_id !== user?.id && !isAdminOrTeacher) {
                toast.error("본인이 작성한 글이거나 관리자여야 수정할 수 있습니다.");
                navigate("/gallery", { replace: true });
                return;
            }
            setOriginalGallery(data as ClassGallery);
            setFormData({
                title: data.title,
                description: data.description || "",
            });

            // Handle media_urls if present, otherwise fallback to media_url
            const urls = data.media_urls && data.media_urls.length > 0
                ? data.media_urls
                : [data.media_url];

            const initialPreviews = urls.map((url: string) => {
                const youtubeId = extractYouTubeId(url);
                const isVideo = url.toLowerCase().match(/\.(mp4|mov|webm)$/) || youtubeId;
                return { url, isVideo: !!isVideo, isOriginal: true };
            });

            setMediaPreviews(initialPreviews);

            const firstYoutubeId = extractYouTubeId(urls[0]);
            if (firstYoutubeId) {
                setUploadType("youtube");
                setYoutubeUrl(urls[0]);
            } else {
                setUploadType("file");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error fetching gallery:", error);
            toast.error(error.message || "데이터를 불러오는 데 실패했습니다.");
            navigate("/gallery");
        } finally {
            setIsDataLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            const newPreviews: { url: string; isVideo: boolean; isOriginal: boolean }[] = [];

            newFiles.forEach(file => {
                const isVideoFile = file.type.startsWith("video/");
                const maxSize = isVideoFile ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

                if (file.size > maxSize) {
                    toast.error(`${file.name}: 파일 크기가 너무 큽니다. (${isVideoFile ? '100MB' : '5MB'} 이하만 가능)`);
                    return;
                }

                validFiles.push(file);
                newPreviews.push({
                    url: URL.createObjectURL(file),
                    isVideo: isVideoFile,
                    isOriginal: false
                });
            });

            setMediaFiles(prev => [...prev, ...validFiles]);
            setMediaPreviews(prev => [...prev, ...newPreviews]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleYoutubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setYoutubeUrl(url);

        const youtubeId = extractYouTubeId(url);
        if (youtubeId) {
            setMediaPreviews([{ url, isVideo: true, isOriginal: false }]);
        } else {
            setMediaPreviews([]);
        }
    };

    const clearMedia = () => {
        mediaPreviews.forEach(preview => {
            if (preview.url.startsWith('blob:')) {
                URL.revokeObjectURL(preview.url);
            }
        });
        setMediaFiles([]);
        setMediaPreviews([]);
        setYoutubeUrl("");
    };

    const removeMediaItem = (index: number) => {
        setMediaPreviews(prev => {
            const item = prev[index];
            if (item && item.url.startsWith('blob:')) {
                URL.revokeObjectURL(item.url);
            }
            return prev.filter((_, i) => i !== index);
        });
        // mediaFiles only contains NEW files. We need to find which one it is.
        // This is a bit tricky if we mixed original and new.
        // Let's rely on isOriginal flag.
    };

    useEffect(() => {
        return () => {
            mediaPreviews.forEach(preview => {
                if (preview.url.startsWith('blob:')) {
                    URL.revokeObjectURL(preview.url);
                }
            });
        };
    }, [mediaPreviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !id || !originalGallery) return;

        if (!formData.title.trim()) {
            toast.error("제목을 입력해주세요.");
            return;
        }

        if (mediaPreviews.length === 0 && uploadType === "file") {
            toast.error("사진 또는 영상을 최소 한 개 이상 업로드해주세요.");
            return;
        }

        if (uploadType === "youtube" && !extractYouTubeId(youtubeUrl)) {
            toast.error("올바른 유튜브 링크를 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("게시물을 수정하는 중입니다...");

        try {
            const finalMediaUrls: string[] = [];
            let isFirstVideoFlag = false;

            if (uploadType === "youtube") {
                const youtubeId = extractYouTubeId(youtubeUrl);
                if (!youtubeId) throw new Error("올바른 유튜브 링크를 입력해주세요.");
                finalMediaUrls.push(youtubeUrl);
                isFirstVideoFlag = true;
            } else {
                // Handle existing and new files
                let newFilesIndex = 0;
                for (const preview of mediaPreviews) {
                    if (preview.isOriginal) {
                        finalMediaUrls.push(preview.url);
                        if (finalMediaUrls.length === 1 && preview.isVideo) {
                            isFirstVideoFlag = true;
                        }
                    } else {
                        const file = mediaFiles[newFilesIndex++];
                        if (!file) continue;

                        const fileExt = file.name.split(".").pop()?.toLowerCase();
                        const fileName = `${crypto.randomUUID()}.${fileExt}`;
                        const filePath = `${user.id}/${fileName}`;

                        const { error: uploadError, data: uploadData } = await supabase.storage
                            .from("gallery-media")
                            .upload(filePath, file, {
                                cacheControl: "3600",
                                upsert: false,
                            });

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from("gallery-media")
                            .getPublicUrl(uploadData.path);

                        finalMediaUrls.push(publicUrl);
                        if (finalMediaUrls.length === 1 && file.type.startsWith("video/")) {
                            isFirstVideoFlag = true;
                        }
                    }
                }
            }

            if (finalMediaUrls.length === 0) throw new Error("처리된 파일이 없습니다.");

            // 2. 데이터베이스 레코드 업데이트
            const { error: updateError } = await supabase
                .from("class_gallery")
                .update({
                    title: formData.title,
                    description: formData.description,
                    media_url: finalMediaUrls[0],
                    media_urls: finalMediaUrls,
                    is_video: isFirstVideoFlag,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            toast.success("게시물이 성공적으로 수정되었습니다.", { id: toastId });
            navigate(`/gallery/${id}`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "게시물 수정 중 오류가 발생했습니다.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !user) return;

        setIsSubmitting(true);
        const toastId = toast.loading("게시물을 삭제하는 중입니다...");
        console.log("Starting deletion process...");

        try {
            // 1. Storage 파일 추출 후 삭제
            const allUrlsToDelete = originalGallery?.media_urls && originalGallery.media_urls.length > 0
                ? originalGallery.media_urls
                : [originalGallery?.media_url].filter(Boolean) as string[];

            console.log("URLs to delete from storage:", allUrlsToDelete);

            const pathsToDelete: string[] = [];
            allUrlsToDelete.forEach(url => {
                if (url && url.includes('/gallery-media/')) {
                    const urlParts = url.split('/gallery-media/');
                    if (urlParts.length > 1) {
                        pathsToDelete.push(urlParts[1]);
                    }
                }
            });

            if (pathsToDelete.length > 0) {
                console.log("Storage paths to delete:", pathsToDelete);
                try {
                    const { error: storageError } = await supabase.storage.from("gallery-media").remove(pathsToDelete);
                    if (storageError) {
                        console.error("Storage deletion error (non-fatal):", storageError);
                    } else {
                        console.log("Storage files deleted successfully");
                    }
                } catch (storageError) {
                    console.error("Storage deletion exception (non-fatal):", storageError);
                }
            }

            // 2. DB 레코드 삭제
            console.log("Deleting DB record with ID:", id);
            const { error: deleteError } = await supabase
                .from("class_gallery")
                .delete()
                .eq("id", id);

            if (deleteError) {
                console.error("DB deletion error:", deleteError);
                throw deleteError;
            }

            console.log("DB record deleted successfully");
            toast.success("게시물이 삭제되었습니다.", { id: toastId });
            navigate("/gallery");

        } catch (error: any) {
            console.error("Delete sequence error:", error);
            toast.error("게시물 삭제 중 오류가 발생했습니다.", { id: toastId });
            setIsSubmitting(false);
        }
    };

    if (isLoading || isDataLoading || !user || !isAdminOrTeacher) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <Helmet>
                <title>아카데미 소식 수정 | 틴틴AI로봇아카데미</title>
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <h1 className="text-3xl font-bold font-heading mb-2">아카데미 소식 수정</h1>
                            <p className="text-muted-foreground">잘못된 정보를 수정하거나 새로운 사진/영상으로 교체하세요.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={isSubmitting}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    삭제하기
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        이 게시물과 관련된 모든 사진 및 영상이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={isSubmitting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isSubmitting ? "삭제 중..." : "글 삭제"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* 미디어 업로드 영역 */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold">
                                미디어 소스 (필수) <span className="text-red-500">*</span>
                            </label>

                            <Tabs value={uploadType} onValueChange={(v) => {
                                setUploadType(v as "file" | "youtube");
                                clearMedia();
                            }}>
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="file">직접 파일 업로드</TabsTrigger>
                                    <TabsTrigger value="youtube">유튜브 링크 연결</TabsTrigger>
                                </TabsList>

                                <TabsContent value="file" className="space-y-4 mt-0">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex-col border-2 border-dashed rounded-xl flex items-center justify-center min-h-[150px] hover:bg-muted/50 transition-colors cursor-pointer group relative overflow-hidden bg-background"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex gap-4 mb-3 relative z-10">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                                <Video className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium relative z-10">클릭하여 새로운 사진 또는 영상 추가</p>
                                        <p className="text-xs text-muted-foreground mt-2 text-center max-w-sm relative z-10 px-4">
                                            최대 10개까지 선택 가능<br />
                                            이미지 5MB / 비디오 100MB 이하
                                        </p>
                                    </div>

                                    {mediaPreviews.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                                            {mediaPreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-black group">
                                                    {preview.isVideo ? (
                                                        <video src={preview.url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={preview.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    )}
                                                    {preview.isVideo && (
                                                        <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded-md">
                                                            <Video className="w-3 h-3 child-video" />
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeMediaItem(index);
                                                        }}
                                                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*,video/mp4,video/quicktime,video/webm"
                                        className="hidden"
                                        multiple
                                    />
                                </TabsContent>

                                <TabsContent value="youtube" className="space-y-4 mt-0">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="유튜브 동영상 링크를 붙여넣으세요. (예: https://youtube.com/watch?v=...)"
                                            value={youtubeUrl}
                                            onChange={handleYoutubeChange}
                                            className="bg-background focus:ring-primary/20"
                                        />
                                        <p className="text-xs text-muted-foreground">유튜브 영상 주소를 복사하여 붙여넣으면 저장 시 영상이 연결됩니다.</p>
                                    </div>

                                    {mediaPreviews.length > 0 && extractYouTubeId(mediaPreviews[0].url) && uploadType === 'youtube' && (
                                        <div className="relative rounded-xl overflow-hidden border bg-black group w-full flex items-center justify-center aspect-video">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${extractYouTubeId(mediaPreviews[0].url)}?autoplay=0`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute top-0 left-0 w-full h-full"
                                            ></iframe>
                                            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm flex items-center shadow-lg">
                                                <Video className="w-4 h-4 mr-1.5" />
                                                유튜브 영상
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-semibold">제목 <span className="text-red-500">*</span></label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="bg-background focus:ring-primary/20"
                                maxLength={60}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-semibold">설명</label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                className="resize-none bg-background focus:ring-primary/20"
                                maxLength={500}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                                취소
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        수정 완료
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditGallery;
