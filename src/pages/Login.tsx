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
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate input based on signup or login
      const schema = isSignUp ? signUpSchema : loginSchema;
      const data = isSignUp ? { email, password, name } : { email, password };
      
      const validationResult = schema.safeParse(data);
      
      if (!validationResult.success) {
        const fieldErrors: { email?: string; password?: string; name?: string } = {};
        validationResult.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field as keyof typeof fieldErrors] = err.message;
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
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

        toast({
          title: "회원가입 성공!",
          description: "로그인해주세요.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "로그인 성공!",
          description: "환영합니다.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message,
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
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
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
              </div>

              <Button 
                type="submit" 
                className="w-full hover-scale" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : (isSignUp ? "회원가입" : "로그인")}
              </Button>
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
