import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioCard } from "@/components/PortfolioCard";
import { LogOut, User as UserIcon, Lock, Edit2, Save, X, Upload, Camera, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project, Comment, Profile, Payment } from "@/types";
import { compressAndConvertImage, formatFileSize } from "@/lib/imageUtils";
import { devLog } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 프로필 수정 관련 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedStudentType, setEditedStudentType] = useState<"초등" | "중등" | "일반">("중등");
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);

  // 프로필 이미지 관련 상태
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);

  // 비밀번호 변경 관련 상태
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState("projects");

  // 사용자 정보 - 간단하게 useState와 useEffect 사용
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session || !session.user) {
          setUserData(null);
          navigate('/login');
          return;
        }
        setUserData(session.user);
      } catch (error) {
        devLog.error('User check error:', error);
        setUserData(null);
        navigate('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkUser();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || !session.user) {
        setUserData(null);
        navigate('/login');
      } else {
        setUserData(session.user);
      }
      setIsLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 프로필 정보 가져오기 (React Query)
  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ["profile", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, avatar_url, student_type')
        .eq('id', userData.id)
        .single();

      if (error) throw error;

      return {
        id: userData.id,
        name: data.name || '',
        email: data.email || '',
        avatar_url: data.avatar_url || null,
        student_type: (data as any).student_type || "중등",
      } as Profile;
    },
    enabled: !!userData?.id,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 프로필 이름 초기화
  useEffect(() => {
    if (profile) {
      setEditedName(profile.name);
      if (profile.student_type) {
        setEditedStudentType(profile.student_type);
      }
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setProfileUpdateLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const { data: updateData, error } = await supabase
        .from('profiles')
        .update({ name: editedName.trim(), student_type: editedStudentType })
        .eq('id', user.id)
        .select('name, email, avatar_url, student_type')
        .single();

      if (error) {
        devLog.error('Profile name update error:', error);
        throw error;
      }

      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 수정되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      setIsEditingProfile(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로필 수정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    devLog.log('=== handleAvatarChange 함수 호출됨 ===');
    const file = e.target.files?.[0];
    devLog.log('선택된 파일:', file);

    if (!file) {
      devLog.warn('⚠️ 파일이 선택되지 않았습니다.');
      return;
    }

    devLog.log('파일 정보:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      devLog.error('파일 크기 초과:', file.size, 'bytes');
      toast({
        title: "파일 크기 초과",
        description: "이미지는 10MB 이하여야 합니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      devLog.log('이미지 압축 시작...');
      toast({
        title: "이미지 처리 중",
        description: "프로필 이미지를 압축하고 최적화하는 중입니다...",
      });

      const compressedFile = await compressAndConvertImage(file);
      devLog.log('이미지 압축 완료:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        name: compressedFile.name
      });

      // 상태 업데이트
      setAvatarFile(compressedFile);
      devLog.log('avatarFile state 설정됨:', compressedFile);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        devLog.log('미리보기 생성됨');
        setAvatarPreview(preview);
      };
      reader.onerror = (error) => {
        devLog.error('미리보기 생성 실패:', error);
      };
      reader.readAsDataURL(compressedFile);

      toast({
        title: "이미지 최적화 완료",
        description: `이미지가 ${formatFileSize(compressedFile.size)}로 최적화되었습니다. 업로드 버튼을 클릭하세요.`,
      });
    } catch (error: unknown) {
      devLog.error("Avatar compression error:", error);
      const errorMessage = error instanceof Error ? error.message : "이미지 처리 중 오류가 발생했습니다.";
      toast({
        title: "이미지 처리 실패",
        description: errorMessage,
        variant: "destructive"
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = async () => {
    devLog.log('=== handleAvatarUpload 함수 호출됨 ===');
    devLog.log('avatarFile:', avatarFile);
    devLog.log('avatarFile 존재 여부:', !!avatarFile);

    if (!avatarFile) {
      devLog.warn('⚠️ avatarFile이 없어서 업로드를 중단합니다.');
      toast({
        title: "파일 없음",
        description: "업로드할 이미지를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    devLog.log('✅ avatarFile 확인 완료, 업로드 시작...');
    setAvatarUploadLoading(true);
    try {
      // 1. 사용자 확인
      devLog.log('1. 사용자 확인 중...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        devLog.error('User fetch error:', userError);
        throw new Error(`사용자 확인 실패: ${userError.message}`);
      }

      if (!user) {
        toast({
          title: "오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      devLog.log('Starting avatar upload for user:', user.id);

      // 2. Storage 버킷 확인 (선택적 - 에러가 나도 계속 진행)
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          devLog.warn('Bucket check error:', bucketError);
        } else {
          const avatarsBucket = buckets?.find(b => b.id === 'avatars');
          if (!avatarsBucket) {
            devLog.warn('avatars bucket not found. Make sure to run the migration SQL.');
          } else {
            devLog.log('avatars bucket found:', avatarsBucket);
          }
        }
      } catch (bucketCheckError) {
        devLog.warn('Error checking buckets:', bucketCheckError);
      }

      // 3. 기존 아바타 삭제 (있는 경우)
      if (profile?.avatar_url) {
        try {
          const oldFileName = profile.avatar_url.split('/').pop();
          if (oldFileName) {
            const oldPath = `${user.id}/${oldFileName}`;
            devLog.log('Removing old avatar:', oldPath);
            const { error: removeError } = await supabase.storage
              .from('avatars')
              .remove([oldPath]);
            if (removeError) {
              devLog.warn('Failed to remove old avatar:', removeError);
              // 기존 파일 삭제 실패해도 계속 진행
            } else {
              devLog.log('Old avatar removed successfully');
            }
          }
        } catch (removeErr) {
          devLog.warn('Error removing old avatar:', removeErr);
          // 계속 진행
        }
      }

      // 4. 새 아바타 업로드
      const fileName = `${user.id}/${Date.now()}.webp`;
      devLog.log('Uploading file:', fileName, 'Size:', avatarFile.size, 'bytes');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        devLog.error('Upload error:', uploadError);
        devLog.error('Upload error details:', {
          message: uploadError.message,
          error: uploadError,
        });
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
      }

      devLog.log('Upload successful:', uploadData);

      // 5. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      devLog.log('Public URL generated:', publicUrl);

      // 6. 프로필 업데이트
      devLog.log('Updating profile with avatar_url:', publicUrl);
      devLog.log('User ID:', user.id);
      devLog.log('Current auth.uid():', (await supabase.auth.getUser()).data.user?.id);

      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select('name, email, avatar_url')
        .single();

      if (updateError) {
        devLog.error('Profile update error:', updateError);
        devLog.error('Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });

        // RLS 정책 위반인지 확인
        if (updateError.code === '42501' || updateError.message?.includes('row-level security')) {
          throw new Error('프로필 업데이트 권한이 없습니다.');
        }

        throw new Error(`프로필 업데이트 실패: ${updateError.message}`);
      }

      if (!updateData) {
        devLog.error('Update returned no data');
        throw new Error('프로필 업데이트는 성공했지만 데이터를 반환받지 못했습니다.');
      }

      devLog.log('Profile updated successfully:', JSON.stringify(updateData, null, 2));
      devLog.log('Updated avatar_url:', updateData.avatar_url);

      // 업데이트된 데이터 확인
      if (!updateData.avatar_url || updateData.avatar_url !== publicUrl) {
        devLog.warn('⚠️ 업데이트된 avatar_url이 예상과 다릅니다!');
        devLog.warn('Expected:', publicUrl);
        devLog.warn('Got:', updateData.avatar_url);
      }

      // 7. 프로필 정보 다시 불러오기
      devLog.log('Refetching profile...');
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });

      toast({
        title: "프로필 이미지 업로드 완료",
        description: "프로필 이미지가 성공적으로 업로드되었습니다.",
      });

      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: unknown) {
      devLog.error('Avatar upload error:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "프로필 이미지 업로드에 실패했습니다. 콘솔을 확인해주세요.",
        variant: "destructive",
      });
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호는 최소 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setPasswordUpdateLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });

      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangingPassword(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  // 내 프로젝트 가져오기 (React Query)
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["myProjects", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!projectsData) return [];

      // N+1 쿼리 최적화: 모든 프로젝트의 댓글/좋아요 개수를 한 번에 조회
      const projectIds = projectsData.map(p => p.id);

      let commentCounts: Record<string, number> = {};
      let likeCounts: Record<string, number> = {};

      if (projectIds.length > 0) {
        const [commentsResult, likesResult] = await Promise.all([
          supabase
            .from('project_comments')
            .select('project_id')
            .in('project_id', projectIds),
          supabase
            .from('project_likes')
            .select('project_id')
            .in('project_id', projectIds)
        ]);

        if (commentsResult.data) {
          commentsResult.data.forEach(comment => {
            commentCounts[comment.project_id] = (commentCounts[comment.project_id] || 0) + 1;
          });
        }

        if (likesResult.data) {
          likesResult.data.forEach(like => {
            likeCounts[like.project_id] = (likeCounts[like.project_id] || 0) + 1;
          });
        }
      }

      return projectsData.map((project) => ({
        ...project,
        commentCount: commentCounts[project.id] || 0,
        likeCount: likeCounts[project.id] || 0
      })) as Project[];
    },
    enabled: !!userData?.id,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 내 결제 내역 가져오기 (React Query)
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["myPayments", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (paymentsData || []) as Payment[];
    },
    enabled: !!userData?.id,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 내 댓글 가져오기 (React Query)
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["myComments", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          id,
          content,
          created_at,
          projects (title)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Comment[];
    },
    enabled: !!userData?.id,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  const loading = isLoadingUser || isLoadingProfile || isLoadingProjects || isLoadingComments || isLoadingPayments;

  // 인증되지 않은 사용자는 아무것도 렌더링하지 않음
  if (!isLoadingUser && !userData) {
    return null;
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "오류",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile?.name || '프로필'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-8 w-8 text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl">{profile?.name}</CardTitle>
                    <CardDescription className="text-sm md:text-base">{profile?.email}</CardDescription>
                    {profile?.student_type && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {profile.student_type}부
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActiveTab("settings")}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">내 프로젝트 ({projects.length})</TabsTrigger>
              <TabsTrigger value="comments">내 댓글 ({comments.length})</TabsTrigger>
              <TabsTrigger value="payments">결제 내역 ({payments.length})</TabsTrigger>
              <TabsTrigger value="settings">계정 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">아직 작성한 프로젝트가 없습니다.</p>
                    <Button onClick={() => navigate('/portfolio')}>프로젝트 작성하기</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/portfolio/${project.id}`)}
                      className="cursor-pointer"
                    >
                      <PortfolioCard
                        id={project.id}
                        title={project.title || "제목 없음"}
                        student={profile?.name || "익명"}
                        description={project.description || ""}
                        category={project.category || "기타"}
                        tags={project.tags || []}
                        commentCount={project.commentCount || 0}
                        likeCount={project.likeCount || 0}
                        viewCount={project.view_count || 0}
                        avatarUrl={profile?.avatar_url || null}
                        imageUrl={project.image_url || null}
                        videoUrl={project.video_url || null}
                        isBest={project.is_best || false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              {comments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">아직 작성한 댓글이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardHeader>
                        <CardTitle className="text-base md:text-lg">
                          {comment.projects?.title || "프로젝트 없음"}
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm md:text-base">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              {payments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">결제 내역이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const statusColors = {
                      completed: "text-green-600",
                      pending: "text-yellow-600",
                      failed: "text-red-600",
                      cancelled: "text-gray-600",
                    };
                    const statusLabels = {
                      completed: "완료",
                      pending: "대기",
                      failed: "실패",
                      cancelled: payment.refunded_amount && payment.refunded_amount > 0 && payment.refunded_amount < payment.amount ? "부분 환불" : "전체 환불",
                    };

                    return (
                      <Card key={payment.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base">
                                  주문번호: {payment.order_id}
                                </CardTitle>
                              </div>
                              <CardDescription className="mt-1 space-y-1">
                                <div>
                                  결제 금액: {Number(payment.amount).toLocaleString()}원
                                  {payment.refunded_amount && payment.refunded_amount > 0 && (
                                    <span className="text-red-600 ml-2 font-semibold">
                                      (부분 환불: {Number(payment.refunded_amount).toLocaleString()}원)
                                    </span>
                                  )}
                                </div>
                                <div>
                                  결제 시간: {new Date(payment.created_at).toLocaleString("ko-KR", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </div>
                                {payment.curriculum_id && (
                                  <div>
                                    커리큘럼 ID: {payment.curriculum_id}
                                  </div>
                                )}
                                {payment.course_id && (
                                  <div>
                                    코스 ID: {payment.course_id}
                                  </div>
                                )}
                                {payment.payment_method && (
                                  <div>
                                    결제 수단: {payment.payment_method}
                                  </div>
                                )}
                              </CardDescription>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-semibold ${statusColors[payment.status] || "text-gray-600"}`}>
                                {statusLabels[payment.status] || payment.status}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                {/* 프로필 정보 수정 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      프로필 정보
                    </CardTitle>
                    <CardDescription>이름, 소속, 프로필 이미지를 수정할 수 있습니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 프로필 이미지 업로드 */}
                    <div className="space-y-2">
                      <Label>프로필 이미지</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url || avatarPreview ? (
                              <img
                                src={avatarPreview || profile?.avatar_url || ''}
                                alt={profile?.name || '프로필'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-10 w-10 text-primary" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            <label htmlFor="avatar-upload-settings" className="cursor-pointer">
                              <Button type="button" variant="outline" size="sm" asChild>
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  이미지 선택
                                </span>
                              </Button>
                              <input
                                id="avatar-upload-settings"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>

                            {/* 업로드 버튼 - avatarFile이 있을 때만 활성화 */}
                            <Button
                              type="button"
                              onClick={handleAvatarUpload}
                              disabled={!avatarFile || avatarUploadLoading}
                              size="sm"
                              className={avatarFile ? "" : "opacity-50 cursor-not-allowed"}
                            >
                              {avatarUploadLoading ? "업로드 중..." : "업로드"}
                            </Button>

                            {/* 취소 버튼 - avatarFile이 있을 때만 표시 */}
                            {avatarFile && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  devLog.log('취소 버튼 클릭됨');
                                  setAvatarFile(null);
                                  setAvatarPreview(null);
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                취소
                              </Button>
                            )}
                          </div>

                          {/* 파일 정보 표시 */}
                          {avatarFile ? (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                선택된 파일: {formatFileSize(avatarFile.size)} (WebP)
                              </p>
                              <p className="text-xs text-green-600 font-medium">
                                ✓ 이미지가 준비되었습니다. 업로드 버튼을 클릭하세요.
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              이미지를 선택하면 업로드 버튼이 활성화됩니다.
                            </p>
                          )}

                          {/* 디버깅 정보 (개발 중에만) */}
                          {process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-gray-400">
                              [디버그] avatarFile: {avatarFile ? '있음' : '없음'} |
                              avatarPreview: {avatarPreview ? '있음' : '없음'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* 이름 및 소속 수정 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">이름</Label>
                        {isEditingProfile ? (
                          <Input
                            id="profile-name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            maxLength={100}
                          />
                        ) : (
                          <Input
                            id="profile-name"
                            value={profile?.name || ""}
                            disabled
                            className="bg-muted"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profile-student-type">소속</Label>
                        {isEditingProfile ? (
                          <Select value={editedStudentType} onValueChange={(val: any) => setEditedStudentType(val)}>
                            <SelectTrigger id="profile-student-type">
                              <SelectValue placeholder="소속을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="초등">초등</SelectItem>
                              <SelectItem value="중등">중등</SelectItem>
                              <SelectItem value="일반">일반</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="profile-student-type"
                            value={profile?.student_type || "중등"}
                            disabled
                            className="bg-muted"
                          />
                        )}
                      </div>

                      {isEditingProfile ? (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleUpdateProfile}
                            disabled={profileUpdateLoading}
                            size="sm"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {profileUpdateLoading ? "저장 중..." : "저장"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setEditedName(profile?.name || "");
                              setEditedStudentType(profile?.student_type || "중등");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingProfile(true);
                              setEditedName(profile?.name || "");
                              setEditedStudentType(profile?.student_type || "중등");
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            프로필 수정
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">이메일</Label>
                      <Input
                        id="profile-email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        이메일은 변경할 수 없습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 비밀번호 변경 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      비밀번호 변경
                    </CardTitle>
                    <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!isChangingPassword ? (
                      <Button
                        onClick={() => setIsChangingPassword(true)}
                        variant="outline"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        비밀번호 변경
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password">새 비밀번호</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="최소 8자 이상"
                            minLength={8}
                          />
                          {newPassword && newPassword.length < 8 && (
                            <p className="text-xs text-destructive">
                              비밀번호는 최소 8자 이상이어야 합니다.
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password">새 비밀번호 확인</Label>
                          <Input
                            id="confirm-new-password"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="비밀번호를 다시 입력하세요"
                            className={confirmNewPassword && newPassword !== confirmNewPassword ? "border-destructive" : confirmNewPassword && newPassword === confirmNewPassword ? "border-green-500" : ""}
                          />
                          {confirmNewPassword && newPassword !== confirmNewPassword && (
                            <p className="text-xs text-destructive">
                              비밀번호가 일치하지 않습니다.
                            </p>
                          )}
                          {confirmNewPassword && newPassword === confirmNewPassword && (
                            <p className="text-xs text-green-500">
                              ✓ 비밀번호가 일치합니다
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleChangePassword}
                            disabled={passwordUpdateLoading || !newPassword || newPassword.length < 8 || newPassword !== confirmNewPassword}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {passwordUpdateLoading ? "변경 중..." : "비밀번호 변경"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsChangingPassword(false);
                              setNewPassword("");
                              setConfirmNewPassword("");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            취소
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyPage;
