import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ClassGallery } from "@/types";
import { getOptimizedThumbnailUrl } from "@/lib/imageUtils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export const ClassGalleryPreview = () => {
    const [galleries, setGalleries] = useState<ClassGallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAdminOrTeacher } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                const { data, error } = await supabase
                    .from("class_gallery")
                    .select(`
    *,
    profiles(name, avatar_url)
        `)
                    .eq("is_hidden", false)
                    .order("created_at", { ascending: false })
                    .limit(4);

                if (error) {
                    console.error("Error fetching class galleries:", error);
                    return;
                }

                if (data) {
                    setGalleries(data as ClassGallery[]);
                }
            } catch (err) {
                console.error("Unexpected error fetching class galleries:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGalleries();
    }, []);

    if (isLoading) {
        return (
            <section className="pt-12 pb-12 px-4 bg-muted/10">
                <div className="container mx-auto">
                    <div className="text-center mb-8 animate-pulse">
                        <div className="h-10 w-48 bg-muted mx-auto rounded mb-3"></div>
                        <div className="h-4 w-64 bg-muted mx-auto rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // 데이터가 없으면 표시하는 빈 상태
    if (galleries.length === 0) {
        return (
            <section id="gallery" className="pt-12 pb-12 px-4 bg-muted/10">
                <div className="container mx-auto">
                    <div className="relative mb-8 animate-fade-in text-center">
                        <div className="w-full">
                            <h2 className="font-heading text-4xl font-bold mb-3 mx-auto">아카데미 소식</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                생생한 아카데미 소식을 사진과 영상으로 만나보세요
                            </p>
                        </div>
                        {isAdminOrTeacher && (
                            <div className="absolute top-0 right-0 hidden md:block">
                                <Button onClick={() => navigate("/gallery/create")} className="shadow-md flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    새 소식 등록
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* 모바일에서만 보이는 등록 버튼 */}
                    {isAdminOrTeacher && (
                        <div className="mb-6 flex justify-center md:hidden">
                            <Button onClick={() => navigate("/gallery/create")} className="shadow-md w-full max-w-xs flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                새 소식 등록
                            </Button>
                        </div>
                    )}
                    <div className="text-center py-12 bg-card/50 rounded-xl border border-dashed animate-fade-in">
                        <p className="text-muted-foreground mb-4">아직 등록된 아카데미 소식이 없습니다.</p>
                        {isAdminOrTeacher && (
                            <Button variant="outline" onClick={() => navigate("/gallery/create")}>
                                첫 소식 등록하기
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-12 pb-12 px-4 bg-muted/10">
            <div className="container mx-auto">
                <div className="relative mb-8 animate-fade-in text-center">
                    <div className="w-full">
                        <h2 className="font-heading text-4xl font-bold mb-3 mx-auto">아카데미 소식</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            생생한 아카데미 소식을 사진과 영상으로 만나보세요
                        </p>
                    </div>
                    {isAdminOrTeacher && (
                        <div className="absolute top-0 right-0 hidden md:block">
                            <Button onClick={() => navigate("/gallery/create")} className="shadow-md flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                새 소식 등록
                            </Button>
                        </div>
                    )}
                </div>

                {/* 모바일에서만 보이는 등록 버튼 */}
                {isAdminOrTeacher && (
                    <div className="mb-6 flex justify-center md:hidden">
                        <Button onClick={() => navigate("/gallery/create")} className="shadow-md w-full max-w-xs flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            새 소식 등록
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {galleries.map((gallery, index) => (
                        <div key={gallery.id} className="relative group/card">
                            <Link
                                to={`/gallery/${gallery.id}`}
                                className="group block overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-md transition-all animate-fade-in hover:-translate-y-1 relative h-full flex flex-col"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="aspect-square relative overflow-hidden bg-muted">
                                    {gallery.is_video ? (
                                        <>
                                            {extractYouTubeId(gallery.media_url) ? (
                                                <img
                                                    src={getYouTubeThumbnail(extractYouTubeId(gallery.media_url)!)}
                                                    alt={gallery.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <video
                                                    src={gallery.media_url}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    muted
                                                    playsInline
                                                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                                    onMouseOut={(e) => {
                                                        const video = e.target as HTMLVideoElement;
                                                        video.pause();
                                                        video.currentTime = 0;
                                                    }}
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                                    <Play className="h-6 w-6 text-white fill-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-md backdrop-blur-sm">
                                                <Video className="w-4 h-4" />
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={getOptimizedThumbnailUrl(gallery.media_url)}
                                            alt={gallery.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1 truncate">{gallery.title}</h3>
                                    {gallery.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {gallery.description}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                        {gallery.profiles?.avatar_url ? (
                                            <img
                                                src={gallery.profiles.avatar_url}
                                                alt={gallery.profiles.name}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {gallery.profiles?.name?.charAt(0) || "T"}
                                            </div>
                                        )}
                                        <span>{gallery.profiles?.name || "선생님"}</span>
                                        <span className="mx-1">•</span>
                                        <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                            {isAdminOrTeacher && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 bg-background/90 backdrop-blur-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate(`/gallery/edit/${gallery.id}`);
                                    }}
                                >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    수정
                                </Button>
                            )}
                            {gallery.is_hidden && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm z-10 font-bold">
                                    비공개
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center animate-fade-in mt-4">
                    <Link to="/gallery" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Button variant="outline" size="lg" className="hover-scale">
                            모든 사진&영상 보기
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
