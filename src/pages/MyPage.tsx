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
import { LogOut, User, Lock, Edit2, Save, X, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project, Comment, Profile } from "@/types";
import { compressAndConvertImage, formatFileSize } from "@/lib/imageUtils";

const MyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 프로필 수정 관련 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    await Promise.all([
      fetchProfile(user.id),
      fetchMyProjects(user.id),
      fetchMyComments(user.id)
    ]);
    
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, email, avatar_url')
      .eq('id', userId)
      .single();

    if (!error && data) {
      const profileData = {
        id: userId,
        name: (data as any).name,
        email: (data as any).email,
        avatar_url: (data as any).avatar_url,
      } as Profile;
      setProfile(profileData);
      setEditedName(profileData.name);
    }
  };

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
        .update({ name: editedName.trim() })
        .eq('id', user.id)
        .select('name, email, avatar_url')
        .single();

      if (error) {
        console.error('Profile name update error:', error);
        throw error;
      }

      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 수정되었습니다.",
      });

      await fetchProfile(user.id);
      setIsEditingProfile(false);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "프로필 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== handleAvatarChange 함수 호출됨 ===');
    const file = e.target.files?.[0];
    console.log('선택된 파일:', file);
    
    if (!file) {
      console.warn('⚠️ 파일이 선택되지 않았습니다.');
      return;
    }

    console.log('파일 정보:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error('파일 크기 초과:', file.size, 'bytes');
      toast({
        title: "파일 크기 초과",
        description: "이미지는 10MB 이하여야 합니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('이미지 압축 시작...');
      toast({
        title: "이미지 처리 중",
        description: "프로필 이미지를 압축하고 최적화하는 중입니다...",
      });

      const compressedFile = await compressAndConvertImage(file);
      console.log('이미지 압축 완료:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        name: compressedFile.name
      });
      
      // 상태 업데이트
      setAvatarFile(compressedFile);
      console.log('avatarFile state 설정됨:', compressedFile);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        console.log('미리보기 생성됨');
        setAvatarPreview(preview);
      };
      reader.onerror = (error) => {
        console.error('미리보기 생성 실패:', error);
      };
      reader.readAsDataURL(compressedFile);
      
      toast({
        title: "이미지 최적화 완료",
        description: `이미지가 ${formatFileSize(compressedFile.size)}로 최적화되었습니다. 업로드 버튼을 클릭하세요.`,
      });
    } catch (error: any) {
      console.error("Avatar compression error:", error);
      toast({
        title: "이미지 처리 실패",
        description: error.message || "이미지 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = async () => {
    console.log('=== handleAvatarUpload 함수 호출됨 ===');
    console.log('avatarFile:', avatarFile);
    console.log('avatarFile 존재 여부:', !!avatarFile);
    
    if (!avatarFile) {
      console.warn('⚠️ avatarFile이 없어서 업로드를 중단합니다.');
      toast({
        title: "파일 없음",
        description: "업로드할 이미지를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ avatarFile 확인 완료, 업로드 시작...');
    setAvatarUploadLoading(true);
    try {
      // 1. 사용자 확인
      console.log('1. 사용자 확인 중...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User fetch error:', userError);
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

      console.log('Starting avatar upload for user:', user.id);

      // 2. Storage 버킷 확인 (선택적 - 에러가 나도 계속 진행)
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          console.warn('Bucket check error:', bucketError);
        } else {
          const avatarsBucket = buckets?.find(b => b.id === 'avatars');
          if (!avatarsBucket) {
            console.warn('avatars bucket not found. Make sure to run the migration SQL.');
          } else {
            console.log('avatars bucket found:', avatarsBucket);
          }
        }
      } catch (bucketCheckError) {
        console.warn('Error checking buckets:', bucketCheckError);
      }

      // 3. 기존 아바타 삭제 (있는 경우)
      if (profile?.avatar_url) {
        try {
          const oldFileName = profile.avatar_url.split('/').pop();
          if (oldFileName) {
            const oldPath = `${user.id}/${oldFileName}`;
            console.log('Removing old avatar:', oldPath);
            const { error: removeError } = await supabase.storage
              .from('avatars')
              .remove([oldPath]);
            if (removeError) {
              console.warn('Failed to remove old avatar:', removeError);
              // 기존 파일 삭제 실패해도 계속 진행
            } else {
              console.log('Old avatar removed successfully');
            }
          }
        } catch (removeErr) {
          console.warn('Error removing old avatar:', removeErr);
          // 계속 진행
        }
      }

      // 4. 새 아바타 업로드
      const fileName = `${user.id}/${Date.now()}.webp`;
      console.log('Uploading file:', fileName, 'Size:', avatarFile.size, 'bytes');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        console.error('Upload error details:', {
          message: uploadError.message,
          error: uploadError,
        });
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // 5. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // 6. 프로필 업데이트
      console.log('Updating profile with avatar_url:', publicUrl);
      console.log('User ID:', user.id);
      console.log('Current auth.uid():', (await supabase.auth.getUser()).data.user?.id);
      
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select('name, email, avatar_url')
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        console.error('Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        // RLS 정책 위반인지 확인
        if (updateError.code === '42501' || updateError.message?.includes('row-level security')) {
          throw new Error(`RLS 정책 위반: 프로필 업데이트 권한이 없습니다. 사용자 ID: ${user.id}`);
        }
        
        throw new Error(`프로필 업데이트 실패: ${updateError.message}`);
      }

      if (!updateData) {
        console.error('Update returned no data');
        throw new Error('프로필 업데이트는 성공했지만 데이터를 반환받지 못했습니다.');
      }

      console.log('Profile updated successfully:', JSON.stringify(updateData, null, 2));
      console.log('Updated avatar_url:', updateData.avatar_url);
      
      // 업데이트된 데이터 확인
      if (!updateData.avatar_url || updateData.avatar_url !== publicUrl) {
        console.warn('⚠️ 업데이트된 avatar_url이 예상과 다릅니다!');
        console.warn('Expected:', publicUrl);
        console.warn('Got:', updateData.avatar_url);
      }

      // 7. 프로필 정보 다시 불러오기
      console.log('Refetching profile...');
      await fetchProfile(user.id);

      toast({
        title: "프로필 이미지 업로드 완료",
        description: "프로필 이미지가 성공적으로 업로드되었습니다.",
      });

      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "오류",
        description: error.message || "프로필 이미지 업로드에 실패했습니다. 콘솔을 확인해주세요.",
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
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  const fetchMyProjects = async (userId: string) => {
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && projectsData) {
      const projectsWithCounts = await Promise.all(
        projectsData.map(async (project) => {
          const [commentResult, likeResult] = await Promise.all([
            supabase
              .from('project_comments')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id),
            supabase
              .from('project_likes')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)
          ]);
          
          return {
            ...project,
            commentCount: commentResult.count || 0,
            likeCount: likeResult.count || 0
          };
        })
      );
      
      setProjects(projectsWithCounts as Project[]);
    }
  };

  const fetchMyComments = async (userId: string) => {
    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        id,
        content,
        created_at,
        projects (title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data as Comment[]);
    }
  };

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
                      {profile?.avatar_url || avatarPreview ? (
                        <img
                          src={avatarPreview || profile?.avatar_url || ''}
                          alt={profile?.name || '프로필'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                      title="프로필 이미지 변경"
                    >
                      <Camera className="h-3 w-3" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    {isEditingProfile ? (
                      <div className="space-y-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="이름을 입력하세요"
                          className="text-2xl font-bold"
                          maxLength={100}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateProfile}
                            disabled={profileUpdateLoading}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {profileUpdateLoading ? "저장 중..." : "저장"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setEditedName(profile?.name || "");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-2xl md:text-3xl">{profile?.name}</CardTitle>
                        <CardDescription className="text-sm md:text-base">{profile?.email}</CardDescription>
                      </>
                    )}
                  </div>
                </div>
                {!isEditingProfile && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditingProfile(true)}
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
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="projects">내 프로젝트 ({projects.length})</TabsTrigger>
              <TabsTrigger value="comments">내 댓글 ({comments.length})</TabsTrigger>
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
                        title={project.title}
                        student={profile?.name || "익명"}
                        description={project.description}
                        category={project.category || "기타"}
                        tags={project.tags || []}
                        commentCount={project.commentCount || 0}
                        likeCount={project.likeCount || 0}
                        viewCount={project.view_count || 0}
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

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                {/* 프로필 정보 수정 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      프로필 정보
                    </CardTitle>
                    <CardDescription>이름과 프로필 이미지를 수정할 수 있습니다.</CardDescription>
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
                              <User className="h-10 w-10 text-primary" />
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
                                  console.log('취소 버튼 클릭됨');
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
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">이름</Label>
                      <div className="flex gap-2">
                        <Input
                          id="profile-name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="이름을 입력하세요"
                          maxLength={100}
                          disabled={!isEditingProfile}
                        />
                        {!isEditingProfile && (
                          <Button
                            onClick={() => setIsEditingProfile(true)}
                            variant="outline"
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            수정
                          </Button>
                        )}
                      </div>
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
                    {isEditingProfile && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={profileUpdateLoading}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {profileUpdateLoading ? "저장 중..." : "저장"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setEditedName(profile?.name || "");
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          취소
                        </Button>
                      </div>
                    )}
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
