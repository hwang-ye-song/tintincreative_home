import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { completePayment } from "@/lib/payment";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import type { Payment, PaymentApproval } from "@/types";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amountParam = searchParams.get("amount");

  useEffect(() => {
    const processPayment = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 토스 페이먼츠에서 리다이렉트된 경우 (paymentKey, orderId, amount가 있는 경우)
      if (paymentKey && orderId && amountParam) {
        setIsProcessing(true);
        try {
          // 먼저 pending 상태의 결제 정보를 조회하여 curriculumId와 courseId를 가져옴
          const { data: pendingPayment, error: fetchError } = await supabase
            .from("payments")
            .select("*")
            .eq("order_id", orderId)
            .eq("user_id", user.id)
            .single();

          if (fetchError || !pendingPayment) {
            throw new Error("결제 정보를 찾을 수 없습니다.");
          }

          // 이미 완료된 결제인 경우 처리하지 않음
          if (pendingPayment.status === "completed") {
            setPayment(pendingPayment as Payment);
            setIsProcessing(false);
            setIsLoading(false);
            return;
          }

          const amount = parseInt(amountParam, 10);
          const paymentApproval: PaymentApproval = {
            paymentKey,
            orderId,
            amount,
          };

          // 결제 승인 및 완료 처리
          const result = await completePayment(
            user.id,
            paymentApproval,
            pendingPayment.curriculum_id || undefined,
            pendingPayment.course_id || undefined
          );

          if (result.success && result.payment) {
            setPayment(result.payment);
            sonnerToast.success("결제가 완료되었습니다!");

            // 차액 결제인 경우 전체 환불 처리
            const isPartialPayment = searchParams.get("isPartialPayment") === "true";
            const originalPaymentId = searchParams.get("originalPaymentId");
            if (isPartialPayment && originalPaymentId) {
              await processFullRefundAfterPartialPayment(user.id, result.payment, originalPaymentId);
            }
          } else {
            toast({
              title: "결제 처리 실패",
              description: result.error || "결제 처리 중 오류가 발생했습니다.",
              variant: "destructive",
            });
            navigate(`/payment/fail?orderId=${orderId}`);
            return;
          }
        } catch (error) {
          console.error("결제 처리 중 오류:", error);
          toast({
            title: "결제 처리 실패",
            description: error instanceof Error ? error.message : "결제 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          navigate(`/payment/fail?orderId=${orderId}`);
          return;
        } finally {
          setIsProcessing(false);
          setIsLoading(false);
        }
      } else if (orderId) {
        // orderId만 있는 경우 (이미 처리된 결제 조회)
        try {
          const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("order_id", orderId)
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("결제 정보 조회 실패:", error);
          } else {
            setPayment(data as Payment);
          }
        } catch (error) {
          console.error("결제 정보 조회 중 오류:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [orderId, paymentKey, amountParam, user, navigate, toast]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <Link to="/login">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>결제 완료 - 결제 성공</title>
        <meta name="description" content="결제가 성공적으로 완료되었습니다." />
      </Helmet>
      <Navbar />

      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                결제가 완료되었습니다!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                결제가 성공적으로 처리되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading || isProcessing ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground mt-4">
                    {isProcessing ? "결제를 처리하는 중..." : "결제 정보를 불러오는 중..."}
                  </p>
                </div>
              ) : payment ? (
                <div className="space-y-3 bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">주문 번호</span>
                    <span className="font-mono text-sm">{payment.order_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="font-bold text-lg">
                      {payment.amount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">결제 상태</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                      {payment.status === "completed" ? "완료" : payment.status}
                    </span>
                  </div>
                  {payment.payment_method && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">결제 수단</span>
                      <span className="text-sm">{payment.payment_method}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">결제 일시</span>
                    <span className="text-sm">
                      {new Date(payment.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  결제 정보를 불러올 수 없습니다.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {payment?.curriculum_id && (
                  <Button
                    onClick={() => navigate(`/curriculum/${payment.curriculum_id}`)}
                    className="flex-1"
                    size="lg"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    커리큘럼 보기
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/mypage")}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  마이페이지
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  홈으로
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

/**
 * 차액 결제 완료 후 전체 환불 처리
 */
async function processFullRefundAfterPartialPayment(
  userId: string,
  currentPayment: Payment,
  originalPaymentId: string
): Promise<void> {
  try {
    // 원래 환불된 결제 찾기
    const { data: refundedPayment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", originalPaymentId)
      .eq("user_id", userId)
      .eq("status", "cancelled")
      .single();

    if (fetchError || !refundedPayment) {
      console.log("이전 환불된 결제를 찾을 수 없습니다.");
      return;
    }
    
    // 이미 전체 환불이 완료되었는지 확인 (refunded_amount가 null이면 전체 환불 완료)
    if (refundedPayment.refunded_amount === null) {
      console.log("이미 전체 환불이 완료되었습니다.");
      return;
    }

    // 차액 계산: 원래 금액 - 이미 환불된 금액
    const originalAmount = Number(refundedPayment.amount);
    const alreadyRefunded = Number(refundedPayment.refunded_amount || 0);
    const remainingAmount = originalAmount - alreadyRefunded;

    // 현재 결제 금액이 남은 금액과 일치하는지 확인
    if (Number(currentPayment.amount) !== remainingAmount) {
      console.log("차액 결제 금액이 일치하지 않습니다.");
      return;
    }

    // 전체 환불 처리 (남은 금액 환불)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("로그인이 필요합니다.");
      return;
    }

    if (!refundedPayment.payment_key) {
      console.error("환불할 결제의 payment_key가 없습니다.");
      return;
    }

    // Supabase Edge Function을 통해 남은 금액 환불
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refund-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        paymentKey: refundedPayment.payment_key,
        cancelReason: "차액 결제 완료 후 전체 환불 처리",
        cancelAmount: remainingAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "환불 처리 실패" }));
      console.error("전체 환불 처리 실패:", errorData);
      return;
    }

    // 결제 상태 업데이트: 전체 환불 완료
    await supabase
      .from("payments")
      .update({
        refunded_amount: null, // null은 전체 환불 완료를 의미
      })
      .eq("id", refundedPayment.id);

    console.log("차액 결제 완료 후 전체 환불이 처리되었습니다.");
  } catch (error) {
    console.error("전체 환불 처리 중 오류:", error);
  }
}

export default PaymentSuccess;

