import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { devLog } from "@/lib/utils";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요").max(255, "이메일은 255자를 초과할 수 없습니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다").max(128, "비밀번호는 128자를 초과할 수 없습니다"),
});

const signUpSchema = loginSchema.extend({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(100, "이름은 100자를 초과할 수 없습니다"),
  confirmPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  studentType: z.enum(["초등", "중등", "일반"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [studentType, setStudentType] = useState("중등");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string; studentType?: string }>({});
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 이메일 중복 확인 (버튼 클릭 시)
  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "이메일 형식 오류",
        description: "유효한 이메일 주소를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setEmailCheckLoading(true);
    setEmailChecked(false);
    try {
      // 프로필 테이블에서 이메일 확인
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116은 "no rows returned" 에러이므로 정상
        devLog.error('이메일 확인 중 오류:', error);
        toast({
          title: "확인 실패",
          description: "이메일 확인 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        setEmailAvailable(null);
        setEmailChecked(false);
      } else {
        const available = !profiles;
        setEmailAvailable(available);
        setEmailChecked(true);

        if (available) {
          toast({
            title: "사용 가능한 이메일",
            description: "이 이메일로 회원가입할 수 있습니다.",
          });
        } else {
          toast({
            title: "이미 사용 중인 이메일",
            description: "다른 이메일을 사용해주세요.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      devLog.error('이메일 확인 중 오류:', error);
      toast({
        title: "확인 실패",
        description: "이메일 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setEmailAvailable(null);
      setEmailChecked(false);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // 이메일이 변경되면 확인 상태 초기화
    if (emailChecked) {
      setEmailChecked(false);
      setEmailAvailable(null);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 현재 사이트의 origin을 사용하여 리다이렉트 (로컬/프로덕션 모두 자동 처리)
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        // 구글 OAuth가 설정되지 않은 경우 더 명확한 메시지 표시
        if (error.message?.includes('missing OAuth secret') || error.message?.includes('Unsupported provider')) {
          toast({
            title: "구글 로그인 설정 필요",
            description: "구글 로그인을 사용하려면 Supabase 대시보드에서 구글 OAuth를 설정해주세요.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setIsLoading(false);
      }
      // 성공하면 리다이렉트되므로 setIsLoading(false) 불필요
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "구글 로그인 중 오류가 발생했습니다.";
      toast({
        title: "구글 로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate input based on signup or login
      const schema = isSignUp ? signUpSchema : loginSchema;
      const data = isSignUp ? { email, password, name, confirmPassword, studentType } : { email, password };

      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        const fieldErrors: { email?: string; password?: string; name?: string; confirmPassword?: string } = {};
        validationResult.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field as keyof typeof fieldErrors] = err.message;
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // 회원가입 시 이메일 중복 확인 필수
      if (isSignUp) {
        if (!emailChecked) {
          toast({
            title: "이메일 중복 확인 필요",
            description: "이메일 중복 확인 버튼을 눌러주세요.",
            variant: "destructive",
          });
          setErrors({ email: "이메일 중복 확인을 해주세요." });
          setIsLoading(false);
          return;
        }
        if (emailAvailable === false) {
          setErrors({ email: "이미 사용 중인 이메일입니다." });
          setIsLoading(false);
          return;
        }
        if (emailAvailable === null) {
          setErrors({ email: "이메일 중복 확인을 해주세요." });
          setIsLoading(false);
          return;
        }
      }

      if (isSignUp) {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              student_type: studentType,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        // 프로필 수동 생성 (트리거가 실패할 경우를 대비)
        if (signUpData.user) {
          // 잠시 대기 후 프로필 확인 및 생성
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            // 먼저 프로필이 있는지 확인
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', signUpData.user.id)
              .maybeSingle();

            // 프로필이 없으면 생성
            if (!existingProfile) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: signUpData.user.id,
                  email: email,
                  name: name,
                  role: 'student',
                  student_type: studentType
                });

              if (profileError) {
                devLog.error('프로필 생성 실패:', profileError);
                toast({
                  title: "프로필 생성 실패",
                  description: "회원가입은 완료되었지만 프로필 생성에 실패했습니다. 관리자에게 문의하세요.",
                  variant: "destructive",
                });
              } else {
                devLog.log('프로필 생성 성공');
              }
            } else {
              devLog.log('프로필이 이미 DB 트리거에 의해 생성되었습니다. 사용자 선택 데이터로 갱신합니다.');
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ student_type: studentType } as any)
                .eq('id', signUpData.user.id);

              if (updateError) {
                devLog.error('프로필 갱신 실패:', updateError);
              }
            }
          } catch (profileErr: unknown) {
            devLog.error('프로필 생성 중 오류:', profileErr);
            toast({
              title: "프로필 생성 오류",
              description: profileErr instanceof Error ? profileErr.message : "프로필 생성 중 오류가 발생했습니다.",
              variant: "destructive",
            });
          }
        }

        toast({
          title: "회원가입 성공!",
          description: "로그인해주세요.",
        });
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setStudentType("중등");
        setEmailAvailable(null);
        setEmailChecked(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // 더 자세한 에러 메시지
          let errorMessage = error.message;

          if (error.message.includes('Invalid login credentials')) {
            errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.';
          } else if (error.message.includes('User not found')) {
            errorMessage = '사용자를 찾을 수 없습니다. 계정이 생성되었는지 확인해주세요.';
          }

          throw new Error(errorMessage);
        }

        // 프로필 확인 및 역할 체크
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name')
            .eq('id', data.user.id)
            .single();

          toast({
            title: "로그인 성공!",
            description: profile?.name ? `${profile.name}님 환영합니다!` : "환영합니다.",
          });

          // 관리자인 경우 관리자 페이지로 이동할 수 있도록
          if (profile?.role === 'admin') {
            toast({
              title: "관리자 로그인",
              description: "관리자 페이지에 접근할 수 있습니다.",
            });
          }
        }

        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.";
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <Card className="w-full max-w-md animate-fade-in animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="font-heading text-2xl">
              {isSignUp ? "회원가입" : "환영합니다"}
            </CardTitle>
            <CardDescription>
              {isSignUp ? "새 계정을 만들어주세요" : "아카데미 계정으로 로그인하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      maxLength={100}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentType">소속</Label>
                    <Select value={studentType} onValueChange={setStudentType}>
                      <SelectTrigger id="studentType">
                        <SelectValue placeholder="소속을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="초등">초등</SelectItem>
                        <SelectItem value="중등">중등</SelectItem>
                        <SelectItem value="일반">일반</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      maxLength={255}
                      className={emailAvailable === false ? "border-destructive" : emailAvailable === true ? "border-green-500" : ""}
                    />
                    {isSignUp && emailCheckLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">확인 중...</span>
                    )}
                    {isSignUp && !emailCheckLoading && emailChecked && emailAvailable === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500">✓ 사용 가능</span>
                    )}
                    {isSignUp && !emailCheckLoading && emailChecked && emailAvailable === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive">✗ 사용 불가</span>
                    )}
                  </div>
                  {isSignUp && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCheckEmail}
                      disabled={emailCheckLoading || !email || !email.includes('@')}
                      className="shrink-0"
                    >
                      {emailCheckLoading ? "확인 중..." : "중복 확인"}
                    </Button>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
                {isSignUp && emailChecked && emailAvailable === true && (
                  <p className="text-xs text-green-500">✓ 사용 가능한 이메일입니다</p>
                )}
                {isSignUp && emailChecked && emailAvailable === false && (
                  <p className="text-xs text-destructive">이미 사용 중인 이메일입니다</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={128}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                {isSignUp && password && (
                  <p className="text-xs text-muted-foreground">
                    {password.length < 8 ? "비밀번호는 최소 8자 이상이어야 합니다" : "✓ 비밀번호 조건을 만족합니다"}
                  </p>
                )}
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    maxLength={128}
                    className={confirmPassword && password !== confirmPassword ? "border-destructive" : confirmPassword && password === confirmPassword ? "border-green-500" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-500">✓ 비밀번호가 일치합니다</p>
                  )}
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full hover-scale"
                size="lg"
                disabled={isLoading || (isSignUp && (!emailChecked || emailAvailable !== true))}
              >
                {isLoading ? "처리 중..." : (isSignUp ? "회원가입" : "로그인")}
              </Button>
              {isSignUp && (!emailChecked || emailAvailable !== true) && (
                <p className="text-xs text-muted-foreground text-center">
                  {!emailChecked ? "이메일 중복 확인을 해주세요" : "사용 가능한 이메일로 회원가입해주세요"}
                </p>
              )}
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full hover-scale"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              구글로 로그인
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? "로그인" : "회원가입"}
              </button>
            </p>
          </CardContent>
        </Card>
        <div className="mt-6">
          <Link to="/">
            <Button variant="outline" className="hover-scale">
              메인 화면으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
