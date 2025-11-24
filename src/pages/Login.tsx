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

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요").max(255, "이메일은 255자를 초과할 수 없습니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다").max(128, "비밀번호는 128자를 초과할 수 없습니다"),
});

const signUpSchema = loginSchema.extend({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(100, "이름은 100자를 초과할 수 없습니다"),
  confirmPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
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
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string }>({});
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
        console.error('이메일 확인 중 오류:', error);
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
      console.error('이메일 확인 중 오류:', error);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate input based on signup or login
      const schema = isSignUp ? signUpSchema : loginSchema;
      const data = isSignUp ? { email, password, name, confirmPassword } : { email, password };
      
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
                  role: 'student'
                });

              if (profileError) {
                console.error('프로필 생성 실패:', profileError);
                toast({
                  title: "프로필 생성 실패",
                  description: "회원가입은 완료되었지만 프로필 생성에 실패했습니다. 관리자에게 문의하세요.",
                  variant: "destructive",
                });
              } else {
                console.log('프로필 생성 성공');
              }
            } else {
              console.log('프로필이 이미 존재합니다');
            }
          } catch (profileErr: any) {
            console.error('프로필 생성 중 오류:', profileErr);
            toast({
              title: "프로필 생성 오류",
              description: profileErr.message || "프로필 생성 중 오류가 발생했습니다.",
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
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
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
