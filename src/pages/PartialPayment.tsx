import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PaymentButton } from "@/components/PaymentButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";

const PartialPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const amount = parseInt(searchParams.get("amount") || "0", 10);
  const userId = searchParams.get("userId") || "";
  const curriculumId = searchParams.get("curriculumId") || undefined;
  const courseId = searchParams.get("courseId") || undefined;
  const orderName = searchParams.get("orderName") || `차액 결제 - ${amount.toLocaleString()}원`;
  const originalPaymentId = searchParams.get("originalPaymentId") || undefined;

  useEffect(() => {
    // URL 파라미터 검증
    if (!amount || amount <= 0) {
      navigate("/");
      return;
    }

    // 사용자 확인 (선택사항 - 링크를 받은 사용자가 본인인지 확인)
    if (user && userId && user.id !== userId) {
      console.warn("링크의 사용자 ID와 로그인한 사용자 ID가 일치하지 않습니다.");
    }
  }, [amount, userId, user, navigate]);

  if (authLoading) {
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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>차액 결제 - 틴틴AI로봇아카데미</title>
      </Helmet>
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>차액 결제</CardTitle>
              <CardDescription>
                부분 환불 후 남은 금액을 결제해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>안내:</strong> 전체 금액이 환불되었으며, 남은 금액만 재결제하는 페이지입니다.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">결제 금액</p>
                <p className="text-2xl font-bold text-primary">
                  {amount.toLocaleString()}원
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">주문명</p>
                <p className="text-muted-foreground">{orderName}</p>
              </div>

              {!user && (
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    결제를 진행하려면 먼저 로그인해주세요.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <PaymentButton
                  amount={amount}
                  orderName={orderName}
                  curriculumId={curriculumId}
                  courseId={courseId}
                  size="lg"
                  className="w-full"
                  isPartialPayment={true}
                  originalPaymentId={originalPaymentId}
                >
                  {amount.toLocaleString()}원 결제하기
                </PaymentButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PartialPayment;

