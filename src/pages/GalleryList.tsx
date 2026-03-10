import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Play, Video, ChevronLeft, ChevronRight, Grid, List as ListIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ClassGallery } from "@/types";
import { getOptimizedThumbnailUrl } from "@/lib/imageUtils";
import { useAuth } from "@/hooks/useAuth";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

const GalleryList = () => {
    const [galleries, setGalleries] = useState<ClassGallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const { isAdminOrTeacher, isLoading: isLoadingAuth } = useAuth();
    const navigate = useNavigate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // 인증 상태 로딩이 완료된 후에만 갤러리 데이터를 가져옴
        if (!isLoadingAuth) {
            fetchGalleries();
        }
    }, [isAdminOrTeacher, isLoadingAuth]);

    const fetchGalleries = async () => {
        try {
            setIsLoading(true);
            const query = supabase
                .from("class_gallery")
                .select(`
          *,
          profiles (name, avatar_url)
        `)
                .order("created_at", { ascending: false });

            // 선생님/관리자가 아니면 기본적으로 숨김 처리되지 않은 것만 가져오기
            // 단, 본인 작성 글은 확인하기 위해 클라이언트 로직으로 처리하거나,
            // 더 안전하게는 여기서 분기할 수 있지만 기존 클라이언트 필터링이 있으므로 전체 데이터를 가져옴
            const { data, error } = await query;

            if (error) throw error;

            // 권한 처리: 관리자/선생님은 모든 게시물을 보고, 일반 사용자는 (숨김이 아니거나 본인 글인 경우)만 본다
            const userStr = localStorage.getItem('supabase.auth.token');
            let currentUser = null;
            try {
                currentUser = userStr ? JSON.parse(userStr).currentSession?.user : null;
            } catch (e) {
                console.error("User parsing error", e);
            }

            const filteredData = data?.filter(item => {
                if (isAdminOrTeacher) return true; // 권한자는 다 봄
                if (!item.is_hidden) return true; // 숨김이 아니면 모두 봄

                // 숨겨져 있지만 내 글인 경우 (사실상 UI에서 숨기기를 지원 안한다면 본인 글만 볼일은 잘 없지만 방어코드)
                return currentUser && item.user_id === currentUser.id;
            }) || [];

            setGalleries(filteredData as ClassGallery[]);
        } catch (error) {
            console.error("Error fetching class galleries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Helmet>
                <title>아카데미 소식 | 틴틴AI로봇아카데미</title>
                <meta name="description" content="틴틴AI로봇아카데미의 생생한 소식을 확인하세요." />
            </Helmet>

            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-4xl font-bold font-heading mb-2">아카데미 소식</h1>
                            <p className="text-muted-foreground">생생한 아카데미 소식을 사진과 영상으로 만나보세요</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-md p-1 bg-muted/30">
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="px-2 py-1 h-auto"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="px-2 py-1 h-auto"
                                    onClick={() => setViewMode("list")}
                                >
                                    <ListIcon className="w-4 h-4" />
                                </Button>
                            </div>

                            {!isLoadingAuth && isAdminOrTeacher && (
                                <Button onClick={() => navigate("/gallery/create")} className="shadow-md">
                                    <Plus className="w-4 h-4 mr-2" />
                                    새 게시물 작성
                                </Button>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className={`bg-card rounded-xl border p-4 ${viewMode === 'grid' ? 'h-72' : 'h-32'} animate-pulse`}>
                                    <div className={`bg-muted rounded-lg ${viewMode === 'grid' ? 'h-40 mb-4' : 'w-32 h-24 float-left mr-4'}`}></div>
                                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : galleries.length === 0 ? (
                        <div className="text-center py-24 bg-muted/10 rounded-2xl border border-dashed">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Grid className="w-8 h-8 text-primary/60" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">아직 등록된 아카데미 소식이 없습니다</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                곧 생생한 소식과 영상이 업로드될 예정입니다.
                            </p>
                            {!isLoadingAuth && isAdminOrTeacher && (
                                <Button onClick={() => navigate("/gallery/create")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    첫 게시물 작성하기
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                            {galleries.map((gallery) => (
                                <Link
                                    to={`/gallery/${gallery.id}`}
                                    key={gallery.id}
                                    className={`group relative bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 ${viewMode === 'list' && 'flex'}`}
                                >
                                    <div className={`relative overflow-hidden bg-muted ${viewMode === 'grid' ? 'aspect-[4/3] w-full' : 'w-48 self-stretch flex-shrink-0 shrink-0 aspect-[4/3] sm:aspect-auto sm:w-64'}`}>
                                        {gallery.is_video ? (
                                            <>
                                                {extractYouTubeId(gallery.media_url) ? (
                                                    <img
                                                        src={getYouTubeThumbnail(extractYouTubeId(gallery.media_url)!)}
                                                        alt={gallery.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        loading="lazy"
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
                                                <div className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-md backdrop-blur-sm">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                            </>
                                        ) : (
                                            <img
                                                src={getOptimizedThumbnailUrl(gallery.media_url)}
                                                alt={gallery.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        )}
                                        {gallery.is_hidden && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                                                비공개
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-5 flex flex-col flex-1 ${viewMode === 'list' && 'justify-center'}`}>
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{gallery.title}</h3>
                                        {gallery.description && (
                                            <p className={`text-muted-foreground text-sm mb-4 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-2 sm:line-clamp-3'}`}>
                                                {gallery.description}
                                            </p>
                                        )}

                                        <div className={`mt-auto flex items-center justify-between text-xs text-muted-foreground ${viewMode === 'grid' ? 'pt-2 border-t' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                {gallery.profiles?.avatar_url ? (
                                                    <img
                                                        src={gallery.profiles.avatar_url}
                                                        alt={gallery.profiles.name || 'User'}
                                                        className="w-6 h-6 rounded-full object-cover border"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                        {gallery.profiles?.name?.charAt(0) || 'T'}
                                                    </div>
                                                )}
                                                <span>{gallery.profiles?.name || '선생님'}</span>
                                            </div>
                                            <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GalleryList;
