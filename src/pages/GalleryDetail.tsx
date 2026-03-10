import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Play, Video, Calendar, User, Edit } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ClassGallery } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { extractYouTubeId } from "@/lib/youtube";

const GalleryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdminOrTeacher, isLoading: isLoadingAuth } = useAuth();

    const [gallery, setGallery] = useState<ClassGallery | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchGalleryDetail();
    }, [id]);

    const fetchGalleryDetail = async () => {
        try {
            if (!id) return;

            const { data, error } = await supabase
                .from("class_gallery")
                .select(`
          *,
          profiles (name, avatar_url)
        `)
                .eq("id", id)
                .single();

            if (error) throw error;
            setGallery(data as ClassGallery);

        } catch (error) {
            console.error("Error fetching gallery detail:", error);
            navigate("/gallery");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!gallery) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">게시물을 찾을 수 없습니다</h2>
                <Button onClick={() => navigate("/gallery")}>목록으로 돌아가기</Button>
            </div>
        );
    }

    const isAuthor = user && gallery.user_id === user.id;
    // 관리자/선생님이면서 본인 글이거나, 아니면 그냥 허용(isAdminOrTeacher 훅 특성상)
    const canEdit = isAdminOrTeacher;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Helmet>
                <title>{gallery.title} | 아카데미 소식</title>
            </Helmet>

            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container px-4 mx-auto max-w-4xl">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:bg-transparent hover:text-primary transition-colors"
                        onClick={() => navigate("/gallery")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        목록으로 돌아가기
                    </Button>

                    <article className="bg-card rounded-2xl shadow-sm border overflow-hidden animate-fade-in">
                        {/* 미디어 영역 */}
                        <div className="w-full bg-black relative flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '70vh' }}>
                            {gallery.is_video ? (
                                extractYouTubeId(gallery.media_url) ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYouTubeId(gallery.media_url)}?autoplay=0`}
                                        title={gallery.title}
                                        className="w-full h-full aspect-video min-h-[50vh]"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        src={gallery.media_url}
                                        controls
                                        className="w-auto h-full max-h-[70vh] object-contain"
                                        poster={gallery.media_url + "#t=0.1"} // 썸네일 대용
                                    >
                                        브라우저가 비디오 태그를 지원하지 않습니다.
                                    </video>
                                )
                            ) : (
                                <img
                                    src={gallery.media_url}
                                    alt={gallery.title}
                                    className="w-auto h-full max-h-[70vh] object-contain"
                                />
                            )}
                            {gallery.is_hidden && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded shadow-md font-bold">
                                    비공개 게시물
                                </div>
                            )}
                        </div>

                        {/* 내용 영역 */}
                        <div className="p-6 md:p-10">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold font-heading mb-4 leading-tight">{gallery.title}</h1>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {gallery.profiles?.avatar_url ? (
                                                <img
                                                    src={gallery.profiles.avatar_url}
                                                    alt="avatar"
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                    {gallery.profiles?.name?.charAt(0) || 'T'}
                                                </div>
                                            )}
                                            <span>{gallery.profiles?.name || '선생님'}</span>
                                        </div>

                                        <span className="hidden sm:inline text-muted-foreground/30">•</span>

                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(gallery.created_at).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>

                                {!isLoadingAuth && canEdit && (
                                    <Link to={`/gallery/edit/${gallery.id}`}>
                                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                                            <Edit className="w-4 h-4 mr-2" />
                                            수정/삭제
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="w-full h-px bg-border mb-8"></div>

                            {gallery.description ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {gallery.description}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">본문 내용이 없습니다.</p>
                            )}
                        </div>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GalleryDetail;
