import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Trash2, Users, Sparkles, Home, Search, CreditCard, Loader2 } from "lucide-react";
import { Project, Comment, Profile, Payment } from "@/types";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { devLog } from "@/lib/utils";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "projects";
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "completed" | "pending" | "failed" | "cancelled">("all");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [adminPasswordDialog, setAdminPasswordDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({ open: false, userId: null, userName: null });
  const [adminPassword, setAdminPassword] = useState("");
  const [refundDialog, setRefundDialog] = useState<{
    open: boolean;
    paymentId: string | null;
    paymentKey: string | null;
    orderId: string | null;
    amount: number | null;
    originalAmount: number | null;
    refundedAmount: number | null;
    curriculumId?: string | null;
    courseId?: string | null;
    userId?: string | null;
  }>({ open: false, paymentId: null, paymentKey: null, orderId: null, amount: null, originalAmount: null, refundedAmount: null, curriculumId: null, courseId: null, userId: null });
  const [refundReason, setRefundReason] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [paymentLinkDialog, setPaymentLinkDialog] = useState<{
    open: boolean;
    link: string | null;
    amount: number | null;
  }>({ open: false, link: null, amount: null });
  const ADMIN_PROMOTION_PASSWORD = "051414";

  // 관리자 권한 확인 (React Query)
  const { data: adminCheck, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["adminCheck"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return { isAdmin: false, user: null };
      }

      // role 컬럼이 없을 수 있으므로 모든 컬럼 선택
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const userRole = (profile as { role?: string })?.role;
      // 에러가 발생하거나 프로필이 없거나 role이 admin 또는 teacher가 아니면 접근 거부
      if (profileError || !profile || (userRole !== "admin" && userRole !== "teacher")) {
        toast({
          title: "권한 없음",
          description: "관리자 또는 선생님만 접근할 수 있습니다.",
          variant: "destructive",
        });
        navigate("/");
        return { isAdmin: false, user: null };
      }

      return { isAdmin: true, user };
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });

  const isAdmin = adminCheck?.isAdmin || false;

  // 커리큘럼 설정 가져오기 (React Query)
  const { data: curriculumSettings = {}, isLoading: isLoadingCurriculumSettings } = useQuery<Record<string, { id: string; is_hidden: boolean }>>({
    queryKey: ["curriculumSettings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("curriculum_settings")
        .select("*");
      
      if (error) {
        devLog.error("Error fetching curriculum settings:", error);
        return {};
      }

      const settingsMap: Record<string, { id: string; is_hidden: boolean }> = {};
      if (data) {
        data.forEach((setting: any) => {
          settingsMap[setting.id] = setting;
        });
      }
      return settingsMap;
    },
    enabled: isAdmin,
    staleTime: 30 * 1000,
  });

  // 커리큘럼 목록 (Index.tsx와 동일)
  const curriculumList = [
    { id: "basic-2", title: "AI 프로그래밍 입문", category: "AI 기초" },
    { id: "basic", title: "기초 트랙 (Perception AI)", category: "AI 기초" },
    { id: "application-4", title: "AI 챗봇 및 대화형 시스템", category: "AI 활용" },
    { id: "application-3", title: "나만의 WEB / Mobile APP디자인", category: "AI 활용" },
    { id: "application-2", title: "컴퓨터 비전", category: "AI 활용" },
    { id: "robot", title: "로봇공학 트랙 - 자율주행", category: "AI로봇" },
    { id: "robot-2", title: "로봇공학 트랙 - 6축 다관절 로봇팔", category: "AI로봇" },
  ];

  // 커리큘럼 숨기기/보이기 토글
  const toggleCurriculumVisibility = async (curriculumId: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      
      // 먼저 설정이 있는지 확인
      const existingSetting = curriculumSettings[curriculumId];
      
      if (existingSetting) {
        // 업데이트
        const { error } = await (supabase as any)
          .from("curriculum_settings")
          .update({ is_hidden: newState })
          .eq("id", curriculumId);

        if (error) throw error;
      } else {
        // 새로 생성
        const { error } = await (supabase as any)
          .from("curriculum_settings")
          .insert({ id: curriculumId, is_hidden: newState });

        if (error) throw error;
      }

      toast({
        title: "성공",
        description: currentState ? "커리큘럼이 공개되었습니다." : "커리큘럼이 숨김 처리되었습니다.",
      });

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["curriculumSettings"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "커리큘럼 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // 프로젝트 목록 가져오기 (React Query)
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["adminProjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Project[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 댓글 목록 가져오기 (React Query)
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["adminComments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_comments")
        .select(`
          *,
          profiles (name, avatar_url),
          projects (title)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Comment[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 사용자 목록 가져오기 (React Query)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<Profile[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200); // 검색을 위해 더 많은 데이터 가져오기

      if (error) throw error;
      return (data || []) as Profile[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 결제 목록 가져오기 (React Query)
  const { data: allPayments = [], isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["adminPayments", paymentStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select(`
          *,
          profiles (id, name, email)
        `);

      if (paymentStatusFilter !== "all") {
        query = query.eq("status", paymentStatusFilter);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []) as Payment[];
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  // 결제 검색 필터링
  const payments = useMemo(() => {
    if (!paymentSearchQuery.trim()) {
      return allPayments;
    }
    const query = paymentSearchQuery.toLowerCase().trim();
    return allPayments.filter((payment) => {
      const profile = (payment as any).profiles;
      const name = (profile?.name || "").toLowerCase();
      const email = (profile?.email || "").toLowerCase();
      const orderId = (payment.order_id || "").toLowerCase();
      const userId = (payment.user_id || "").toLowerCase();
      return name.includes(query) || email.includes(query) || orderId.includes(query) || userId.includes(query);
    });
  }, [allPayments, paymentSearchQuery]);

  // 사용자 검색 필터링
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) {
      return users;
    }
    const query = userSearchQuery.toLowerCase().trim();
    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [users, userSearchQuery]);

  // 통계 가져오기 (React Query)
  const { data: stats = {
    totalProjects: 0,
    totalComments: 0,
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    hiddenProjects: 0,
    hiddenComments: 0,
  }, isLoading: isLoadingStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [projectsResult, commentsResult, usersResult, paymentsResult, completedPaymentsResult, hiddenProjectsResult, hiddenCommentsResult] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("project_comments").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount").eq("status", "completed"),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_hidden", true),
        supabase.from("project_comments").select("*", { count: "exact", head: true }).eq("is_hidden", true),
      ]);

      const totalRevenue = completedPaymentsResult.data?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;

      return {
        totalProjects: projectsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalPayments: paymentsResult.count || 0,
        totalRevenue: totalRevenue,
        hiddenProjects: hiddenProjectsResult.count || 0,
        hiddenComments: hiddenCommentsResult.count || 0,
      };
    },
    enabled: isAdmin,
    staleTime: 30 * 1000, // 30초간 캐시
  });

  const loading = isLoadingAdmin || isLoadingProjects || isLoadingComments || isLoadingUsers || isLoadingPayments || isLoadingStats;

  const toggleProjectVisibility = async (projectId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_hidden: !currentState })
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "프로젝트가 공개되었습니다." : "프로젝트가 숨김 처리되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // 포트폴리오 페이지 캐시도 무효화
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleCommentVisibility = async (commentId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("project_comments")
        .update({ is_hidden: !currentState })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "댓글이 공개되었습니다." : "댓글이 숨김 처리되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminComments"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 상태 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleBestProject = async (projectId: string, currentState: boolean) => {
    try {
      const nextBest = !currentState;
      
      // 카테고리는 변경하지 않고 is_best만 변경
      const { error } = await supabase
        .from("projects")
        .update({ is_best: nextBest } as any)
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "BEST에서 해제되었습니다." : "BEST로 지정되었습니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "BEST 설정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleFeaturedHome = async (projectId: string, currentState: boolean) => {
    try {
      const nextFeatured = !currentState;
      
      const { error } = await supabase
        .from("projects")
        .update({ is_featured_home: nextFeatured } as any)
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: currentState ? "홈페이지에서 제거되었습니다." : "홈페이지에 표시됩니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "홈페이지 표시 설정에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("정말 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "프로젝트가 삭제되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("project_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminComments"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["projectComments"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (userId: string, userName: string, newRole: "admin" | "teacher" | "student", currentRole: string) => {
    // 자기 자신의 역할은 변경할 수 없음
    if (adminCheck?.user?.id === userId) {
      toast({
        title: "오류",
        description: "자기 자신의 역할은 변경할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // 관리자로 승격하는 경우 비밀번호 확인 필요
    if (newRole === "admin" && currentRole !== "admin") {
      setAdminPasswordDialog({ open: true, userId, userName });
      setAdminPassword("");
      return;
    }

    // 학생 → 선생님 또는 다른 역할 변경은 바로 실행
    updateUserRole(userId, newRole);
  };

  const confirmAdminPromotion = async () => {
    if (adminPassword !== ADMIN_PROMOTION_PASSWORD) {
      toast({
        title: "오류",
        description: "비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (adminPasswordDialog.userId) {
      await updateUserRole(adminPasswordDialog.userId, "admin");
      setAdminPasswordDialog({ open: false, userId: null, userName: null });
      setAdminPassword("");
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "teacher" | "student") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole } as any)
        .eq("id", userId);

      if (error) {
        devLog.error("Role update error:", error);
        throw error;
      }

      const roleNames = {
        admin: "관리자",
        teacher: "선생님",
        student: "학생",
      };

      toast({
        title: "성공",
        description: `사용자 역할이 ${roleNames[newRole]}로 변경되었습니다.`,
      });

      // 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "사용자 역할 변경에 실패했습니다.";
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRefund = async () => {
    if (!refundDialog.paymentKey || !refundDialog.orderId || !refundDialog.amount || !refundDialog.paymentId) {
      toast({
        title: "오류",
        description: "환불 정보가 올바르지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingRefund(true);

    try {
      // 최신 결제 정보를 DB에서 다시 조회하여 정확한 환불 가능 금액 확인
      const { data: currentPayment, error: fetchError } = await supabase
        .from("payments")
        .select("amount, refunded_amount")
        .eq("id", refundDialog.paymentId)
        .single();

      if (fetchError || !currentPayment) {
        throw new Error("결제 정보를 불러올 수 없습니다.");
      }

      const originalAmount = Number(currentPayment.amount);
      const alreadyRefunded = Number(currentPayment.refunded_amount || 0);
      const availableRefundAmount = originalAmount - alreadyRefunded;

      // 부분 환불인 경우 금액 검증
      if (refundType === "partial") {
        const partialAmount = parseInt(refundAmount.replace(/,/g, ""), 10);
        if (isNaN(partialAmount) || partialAmount <= 0) {
          toast({
            title: "오류",
            description: "환불 금액을 올바르게 입력해주세요.",
            variant: "destructive",
          });
          setIsProcessingRefund(false);
          return;
        }
        
        if (partialAmount > availableRefundAmount) {
          toast({
            title: "오류",
            description: `환불 가능 금액은 ${availableRefundAmount.toLocaleString()}원입니다. (원래 금액: ${originalAmount.toLocaleString()}원, 이미 환불: ${alreadyRefunded.toLocaleString()}원)`,
            variant: "destructive",
          });
          setIsProcessingRefund(false);
          return;
        }
        if (partialAmount >= availableRefundAmount) {
          toast({
            title: "오류",
            description: "환불 금액이 환불 가능 금액과 같거나 더 큽니다. 전체 환불을 선택해주세요.",
            variant: "destructive",
          });
          setIsProcessingRefund(false);
          return;
        }
      } else {
        // 전체 환불인 경우 남은 금액이 정확한지 확인
        if (availableRefundAmount <= 0) {
          toast({
            title: "오류",
            description: "환불 가능한 금액이 없습니다.",
            variant: "destructive",
          });
          setIsProcessingRefund(false);
          return;
        }
      }

      // Supabase Edge Function을 통해 환불 처리
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      const requestBody: any = {
        paymentKey: refundDialog.paymentKey,
        cancelReason: refundReason || (refundType === "partial" ? "부분 환불 - 전체 취소 후 차액 재결제" : "관리자 환불 처리"),
      };

      // 부분 환불인 경우: 전체 금액을 먼저 취소 (cancelAmount 없이 전체 환불)
      // 전체 환불인 경우: 전체 금액 취소
      // (부분 환불은 전체 취소 후 차액 재결제 방식으로 진행)

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refund-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "환불 처리 실패", error: "알 수 없는 오류" }));
        const errorMessage = errorData.message || errorData.error || "환불 처리에 실패했습니다.";
        const errorDetails = errorData.details ? JSON.stringify(errorData.details) : "";
        throw new Error(`${errorMessage}${errorDetails ? ` (상세: ${errorDetails})` : ""}`);
      }

      const result = await response.json();

      // 부분 환불인 경우: 차액 계산 및 결제 링크 생성
      let remainingAmount = 0;
      if (refundType === "partial") {
        const partialAmount = parseInt(refundAmount.replace(/,/g, ""), 10);
        remainingAmount = originalAmount - partialAmount; // 남은 금액 = 원래 금액 - 환불할 금액
      }

      // 결제 상태 업데이트
      // 부분 환불도 cancelled 상태로 변경하여 환불 탭에 표시
      const updateData: any = {
        status: "cancelled",
      };

      // 부분 환불인 경우 환불 금액 저장
      if (refundType === "partial") {
        const partialAmount = parseInt(refundAmount.replace(/,/g, ""), 10);
        // 기존 환불 금액이 있으면 누적
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("refunded_amount")
          .eq("id", refundDialog.paymentId)
          .single();
        
        const existingRefunded = existingPayment?.refunded_amount || 0;
        updateData.refunded_amount = existingRefunded + partialAmount;
      } else {
        // 전체 환불인 경우 refunded_amount는 null (전체 금액 환불)
        updateData.refunded_amount = null;
      }

      const { error: updateError } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", refundDialog.paymentId);

      if (updateError) {
        console.error("결제 상태 업데이트 실패:", updateError);
      }

      // 전체 환불인 경우에만 등록 정보 삭제
      if (refundType === "full" && refundDialog.paymentId) {
        const { data: paymentData } = await supabase
          .from("payments")
          .select("user_id, curriculum_id, course_id")
          .eq("id", refundDialog.paymentId)
          .single();

        if (paymentData) {
          if (paymentData.curriculum_id) {
            await supabase
              .from("enrollments")
              .delete()
              .eq("user_id", paymentData.user_id)
              .eq("curriculum_id", paymentData.curriculum_id);
          }
          if (paymentData.course_id) {
            await supabase
              .from("enrollments")
              .delete()
              .eq("user_id", paymentData.user_id)
              .eq("course_id", paymentData.course_id);
          }
        }
      }

      // 부분 환불인 경우 차액 결제 링크 생성
      if (refundType === "partial" && remainingAmount > 0) {
        // 차액 결제 링크 생성
        const paymentLink = generatePaymentLink(
          remainingAmount,
          currentPayment.user_id,
          currentPayment.curriculum_id,
          currentPayment.course_id,
          `차액 결제 - ${refundDialog.orderId}`,
          refundDialog.paymentId || undefined
        );

        // 결제 링크 다이얼로그 표시
        setPaymentLinkDialog({
          open: true,
          link: paymentLink,
          amount: remainingAmount,
        });
      } else {
        toast({
          title: "환불 완료",
          description: refundType === "full" 
            ? `전체 환불이 성공적으로 처리되었습니다.`
            : `${parseInt(refundAmount.replace(/,/g, ""), 10).toLocaleString()}원 환불이 성공적으로 처리되었습니다.`,
        });
      }

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });

      // 환불 다이얼로그 닫기
      setRefundDialog({ open: false, paymentId: null, paymentKey: null, orderId: null, amount: null, originalAmount: null, refundedAmount: null, curriculumId: null, courseId: null, userId: null });
      setRefundReason("");
      setRefundType("full");
      setRefundAmount("");
      setIsProcessingRefund(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "환불 처리에 실패했습니다.";
      toast({
        title: "환불 실패",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessingRefund(false);
    }
  };

  // 차액 결제 링크 생성 함수
  const generatePaymentLink = (
    amount: number,
    userId: string,
    curriculumId?: string | null,
    courseId?: string | null,
    orderName?: string,
    originalPaymentId?: string
  ): string => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      amount: amount.toString(),
      userId: userId,
      orderName: orderName || `차액 결제 - ${amount.toLocaleString()}원`,
    });
    
    if (curriculumId) {
      params.append("curriculumId", curriculumId);
    }
    if (courseId) {
      params.append("courseId", courseId);
    }
    if (originalPaymentId) {
      params.append("originalPaymentId", originalPaymentId);
    }

    return `${baseUrl}/payment/partial?${params.toString()}`;
  };

  // 링크 복사 함수
  const copyPaymentLink = async () => {
    if (paymentLinkDialog.link) {
      try {
        await navigator.clipboard.writeText(paymentLinkDialog.link);
        toast({
          title: "링크 복사 완료",
          description: "결제 링크가 클립보드에 복사되었습니다.",
        });
      } catch (error) {
        toast({
          title: "복사 실패",
          description: "링크 복사에 실패했습니다. 링크를 직접 복사해주세요.",
          variant: "destructive",
        });
      }
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>관리자 페이지</title>
      </Helmet>
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="font-heading text-3xl font-bold">관리자 페이지</h1>
            </div>
            <p className="text-muted-foreground">사이트 전체를 관리할 수 있습니다.</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  숨김: {stats.hiddenProjects}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 댓글</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  숨김: {stats.hiddenComments}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">전체 결제</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}원</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="projects">프로젝트 관리</TabsTrigger>
              <TabsTrigger value="featured">홈페이지 프로젝트</TabsTrigger>
              <TabsTrigger value="comments">댓글 관리</TabsTrigger>
              <TabsTrigger value="users">사용자 관리</TabsTrigger>
              <TabsTrigger value="payments">결제 관리</TabsTrigger>
              <TabsTrigger value="curriculums">커리큘럼 관리</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <CardDescription>
                            작성자: {project.profiles?.name || "익명"} | 
                            {new Date(project.created_at).toLocaleDateString("ko-KR")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={project.is_best ? "default" : "outline"}
                            onClick={() => toggleBestProject(project.id, project.is_best || false)}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {project.is_best ? "BEST 해제" : "BEST 지정"}
                          </Button>
                          <Button
                            size="sm"
                            variant={project.is_hidden ? "default" : "outline"}
                            onClick={() => toggleProjectVisibility(project.id, project.is_hidden || false)}
                          >
                            {project.is_hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                공개
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                숨김
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="mt-6">
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  홈페이지에 표시할 프로젝트를 선택하세요. 최대 3개까지 선택할 수 있으며, 선택된 프로젝트는 홈페이지의 "학생 프로젝트" 섹션에 표시됩니다.
                </p>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <CardDescription>
                            작성자: {project.profiles?.name || "익명"} | 
                            {new Date(project.created_at).toLocaleDateString("ko-KR")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={(project.is_featured_home || false) ? "default" : "outline"}
                            onClick={() => toggleFeaturedHome(project.id, project.is_featured_home || false)}
                          >
                            <Home className="mr-2 h-4 w-4" />
                            {(project.is_featured_home || false) ? "홈에서 제거" : "홈에 표시"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {comment.projects?.title || "프로젝트 없음"}
                          </CardTitle>
                          <CardDescription>
                            작성자: {comment.profiles?.name || "익명"} | 
                            {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                          </CardDescription>
                          <p className="text-sm mt-2">{comment.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={comment.is_hidden ? "default" : "outline"}
                            onClick={() => toggleCommentVisibility(comment.id, comment.is_hidden || false)}
                          >
                            {comment.is_hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                공개
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                숨김
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="이름 또는 이메일로 검색..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {userSearchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteredUsers.length}명의 사용자를 찾았습니다.
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {userSearchQuery ? "검색 결과가 없습니다." : "사용자가 없습니다."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.map((user) => {
                    const currentRole = (user.role || "student") as "admin" | "teacher" | "student";
                    const isCurrentUser = adminCheck?.user?.id === user.id;
                    
                    return (
                      <Card key={user.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{user.name || "이름 없음"}</CardTitle>
                              <CardDescription className="mt-1">
                                {user.email || "이메일 없음"}
                              </CardDescription>
                            </div>
                            <div className="ml-4">
                              <Select
                                value={currentRole}
                                onValueChange={(value: "admin" | "teacher" | "student") => {
                                  handleRoleChange(user.id, user.name || "사용자", value, currentRole);
                                }}
                                disabled={isCurrentUser}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue>
                                    {currentRole === "admin" ? "관리자" : currentRole === "teacher" ? "선생님" : "학생"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">학생</SelectItem>
                                  <SelectItem value="teacher">선생님</SelectItem>
                                  <SelectItem value="admin">관리자</SelectItem>
                                </SelectContent>
                              </Select>
                              {isCurrentUser && (
                                <p className="text-xs text-muted-foreground mt-1 text-center">
                                  (본인)
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              {/* 상태별 카테고리 탭 */}
              <Tabs value={paymentStatusFilter} onValueChange={(value: "all" | "completed" | "pending" | "failed" | "cancelled") => setPaymentStatusFilter(value)} className="w-full mb-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">전체 상태</TabsTrigger>
                  <TabsTrigger value="completed">성공</TabsTrigger>
                  <TabsTrigger value="pending">대기</TabsTrigger>
                  <TabsTrigger value="failed">실패</TabsTrigger>
                  <TabsTrigger value="cancelled">환불</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="결제자 이름, 이메일, 주문번호로 검색..."
                    value={paymentSearchQuery}
                    onChange={(e) => setPaymentSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  총 {payments.length}건
                </p>
              </div>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {paymentStatusFilter === "all" ? "결제 내역이 없습니다." : `${paymentStatusFilter === "completed" ? "성공" : paymentStatusFilter === "pending" ? "대기" : paymentStatusFilter === "failed" ? "실패" : "취소/환불"} 상태의 결제 내역이 없습니다.`}
                    </CardContent>
                  </Card>
                ) : (
                  payments.map((payment) => {
                    const profile = (payment as any).profiles;
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
                                  결제자: {profile?.name || "이름 없음"} ({profile?.email || payment.user_id})
                                </div>
                                <div>
                                  결제자 ID: {payment.user_id}
                                </div>
                                <div>
                                  결제 금액: {Number(payment.amount).toLocaleString()}원
                                </div>
                                {payment.refunded_amount && payment.refunded_amount > 0 && (
                                  <div className="text-red-600 font-semibold">
                                    {Number(payment.refunded_amount).toLocaleString()}원 환불 완료
                                  </div>
                                )}
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
                            <div className="ml-4 flex flex-col items-end gap-2">
                              <div className={`text-sm font-semibold ${statusColors[payment.status] || "text-gray-600"}`}>
                                {statusLabels[payment.status] || payment.status}
                              </div>
                              {payment.status === "completed" && payment.payment_key && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setRefundDialog({
                                      open: true,
                                      paymentId: payment.id,
                                      paymentKey: payment.payment_key || null,
                                      orderId: payment.order_id,
                                      amount: Number(payment.amount) - (payment.refunded_amount || 0),
                                      originalAmount: Number(payment.amount),
                                      refundedAmount: payment.refunded_amount || 0,
                                      curriculumId: payment.curriculum_id || null,
                                      courseId: payment.course_id || null,
                                      userId: payment.user_id || null,
                                    });
                                    setRefundReason("");
                                    setRefundType("full");
                                    setRefundAmount("");
                                  }}
                                >
                                  환불 처리
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="curriculums" className="mt-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">커리큘럼 표시 설정</h2>
                  <p className="text-sm text-muted-foreground">
                    각 커리큘럼의 표시 여부를 설정할 수 있습니다. 숨김 처리된 커리큘럼은 홈페이지에 표시되지 않습니다.
                  </p>
                </div>
                {isLoadingCurriculumSettings ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : (
                  curriculumList.map((curriculum) => {
                    const setting = curriculumSettings[curriculum.id];
                    const isHidden = setting?.is_hidden || false;
                    
                    return (
                      <Card key={curriculum.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{curriculum.title}</CardTitle>
                              <CardDescription>
                                ID: {curriculum.id} | 카테고리: {curriculum.category}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={isHidden ? "default" : "outline"}
                                onClick={() => toggleCurriculumVisibility(curriculum.id, isHidden)}
                              >
                                {isHidden ? (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    공개
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    숨김
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 관리자 승격 비밀번호 확인 다이얼로그 */}
      <Dialog open={adminPasswordDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAdminPasswordDialog({ open: false, userId: null, userName: null });
          setAdminPassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 승격 확인</DialogTitle>
            <DialogDescription>
              {adminPasswordDialog.userName}님을 관리자로 승격하려면 비밀번호를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmAdminPromotion();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdminPasswordDialog({ open: false, userId: null, userName: null });
                setAdminPassword("");
              }}
            >
              취소
            </Button>
            <Button onClick={confirmAdminPromotion}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 환불 확인 다이얼로그 */}
      <Dialog open={refundDialog.open} onOpenChange={(open) => {
        if (!open && !isProcessingRefund) {
          setRefundDialog({ open: false, paymentId: null, paymentKey: null, orderId: null, amount: null, originalAmount: null, refundedAmount: null });
          setRefundReason("");
          setRefundType("full");
          setRefundAmount("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 처리</DialogTitle>
            <DialogDescription>
              정말 이 결제를 환불하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">주문번호</p>
              <p className="text-sm text-muted-foreground">{refundDialog.orderId}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">원래 결제 금액</p>
              <p className="text-sm text-muted-foreground">{refundDialog.originalAmount?.toLocaleString() || refundDialog.amount?.toLocaleString()}원</p>
            </div>
            {refundDialog.refundedAmount && refundDialog.refundedAmount > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">이미 환불된 금액</p>
                <p className="text-sm text-red-600 font-semibold">{refundDialog.refundedAmount.toLocaleString()}원</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-1">환불 가능 금액</p>
              <p className="text-sm text-blue-600 font-semibold">{refundDialog.amount?.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">환불 유형</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundType"
                    value="full"
                    checked={refundType === "full"}
                    onChange={(e) => {
                      setRefundType(e.target.value as "full" | "partial");
                      setRefundAmount("");
                    }}
                    disabled={isProcessingRefund}
                  />
                  <span className="text-sm">전체 환불</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundType"
                    value="partial"
                    checked={refundType === "partial"}
                    onChange={(e) => {
                      setRefundType(e.target.value as "full" | "partial");
                      setRefundAmount("");
                    }}
                    disabled={isProcessingRefund}
                  />
                  <span className="text-sm">부분 환불</span>
                </label>
              </div>
            </div>
            {refundType === "partial" && (
              <div>
                <Label htmlFor="refundAmount" className="text-sm font-medium mb-1">
                  환불 금액
                </Label>
                <Input
                  id="refundAmount"
                  type="text"
                  placeholder="환불할 금액을 입력하세요"
                  value={refundAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setRefundAmount(value);
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value.replace(/,/g, ""), 10);
                    if (!isNaN(value) && value > 0) {
                      setRefundAmount(value.toLocaleString());
                    }
                  }}
                  disabled={isProcessingRefund}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  최대 환불 가능 금액: {refundDialog.amount?.toLocaleString()}원
                  {refundDialog.refundedAmount && refundDialog.refundedAmount > 0 && (
                    <span className="ml-2 text-red-600">
                      (이미 {refundDialog.refundedAmount.toLocaleString()}원 환불됨)
                    </span>
                  )}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="refundReason" className="text-sm font-medium mb-1">
                환불 사유
              </Label>
                <Input
                  id="refundReason"
                  placeholder="환불 사유를 입력하세요 (선택사항)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  disabled={isProcessingRefund}
                />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRefundDialog({ open: false, paymentId: null, paymentKey: null, orderId: null, amount: null, originalAmount: null, refundedAmount: null, curriculumId: null, courseId: null, userId: null });
                setRefundReason("");
                setRefundType("full");
                setRefundAmount("");
              }}
              disabled={isProcessingRefund}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRefund}
              disabled={
                isProcessingRefund || 
                (refundType === "partial" && (!refundAmount || parseInt(refundAmount.replace(/,/g, ""), 10) <= 0 || parseInt(refundAmount.replace(/,/g, ""), 10) >= (refundDialog.amount || 0)))
              }
            >
              {isProcessingRefund ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  환불 처리 중...
                </>
              ) : (
                `${refundType === "full" ? "전체 환불" : "부분 환불"} 처리`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 차액 결제 링크 다이얼로그 */}
      <Dialog open={paymentLinkDialog.open} onOpenChange={(open) => {
        if (!open) {
          setPaymentLinkDialog({ open: false, link: null, amount: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>차액 결제 링크 생성 완료</DialogTitle>
            <DialogDescription>
              전체 금액이 환불되었습니다. 남은 금액({paymentLinkDialog.amount?.toLocaleString()}원)을 결제하기 위한 링크가 생성되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="paymentLink" className="text-sm font-medium mb-2">
                결제 링크
              </Label>
              <div className="flex gap-2">
                <Input
                  id="paymentLink"
                  value={paymentLinkDialog.link || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={copyPaymentLink}
                  className="whitespace-nowrap"
                >
                  복사
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                이 링크를 사용자에게 전달하여 차액 결제를 진행하세요.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>안내:</strong> 부분 환불은 전체 금액을 먼저 취소한 후, 남은 금액만 재결제하는 방식으로 진행됩니다.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentLinkDialog({ open: false, link: null, amount: null });
              }}
            >
              닫기
            </Button>
            <Button
              onClick={() => {
                if (paymentLinkDialog.link) {
                  window.open(paymentLinkDialog.link, "_blank");
                }
              }}
            >
              링크 열기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminPage;

