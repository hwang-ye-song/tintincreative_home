import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { savePaymentToDatabase } from "@/lib/payment";
import { toast as sonnerToast } from "sonner";

interface PaymentButtonProps {
  amount: number;
  orderName: string;
  curriculumId?: string;
  courseId?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
  successUrl?: string;
  failUrl?: string;
  isPartialPayment?: boolean;
  originalPaymentId?: string;
}

declare global {
  interface Window {
    TossPayments: any;
  }
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  orderName,
  curriculumId,
  courseId,
  className,
  size = "default",
  variant = "default",
  children,
  successUrl,
  failUrl,
  isPartialPayment = false,
  originalPaymentId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tossPayments, setTossPayments] = useState<any>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const clientKey = import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY || "";

  useEffect(() => {
    if (!clientKey) {
      console.error("토스 페이먼츠 클라이언트 키가 설정되지 않았습니다.");
      console.error("환경 변수 확인:", {
        VITE_TOSS_PAYMENTS_CLIENT_KEY: import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY,
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD
      });
      console.error("해결 방법: 프로젝트 루트에 .env 파일을 생성하고 VITE_TOSS_PAYMENTS_CLIENT_KEY를 설정하세요.");
      console.error("또는 DB.env 파일의 내용을 .env로 복사하세요.");
      return;
    }

    // 토스 페이먼츠 SDK 로드
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) {
        setTossPayments(window.TossPayments(clientKey));
      }
    };
    document.body.appendChild(script);

    return () => {
      // 스크립트 정리 (필요한 경우)
      const existingScript = document.querySelector('script[src="https://js.tosspayments.com/v1/payment"]');
      if (existingScript) {
        // 스크립트는 유지 (다른 컴포넌트에서도 사용할 수 있음)
      }
    };
  }, [clientKey]);

  const generateOrderId = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "결제를 진행하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!tossPayments) {
      toast({
        title: "결제 시스템 초기화 중",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || amount <= 0) {
      toast({
        title: "결제 금액 오류",
        description: "올바른 결제 금액을 설정해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const orderId = generateOrderId();
      const finalSuccessUrl = successUrl || `${window.location.origin}/payment/success?orderId=${orderId}${isPartialPayment && originalPaymentId ? `&isPartialPayment=true&originalPaymentId=${originalPaymentId}` : ""}`;
      const finalFailUrl = failUrl || `${window.location.origin}/payment/fail?orderId=${orderId}`;

      // 결제 정보를 먼저 DB에 저장 (pending 상태)
      const payment = await savePaymentToDatabase(
        user.id,
        "", // paymentKey는 결제 승인 후 받음
        orderId,
        amount,
        curriculumId,
        courseId,
        "pending"
      );

      if (!payment) {
        throw new Error("결제 정보 자동저장 실패");
      }

      // 토스 페이먼츠 결제 위젯 열기
      await tossPayments.requestPayment("카드", {
        amount: amount,
        orderId: orderId,
        orderName: orderName,
        customerName: user.email || "고객",
        successUrl: finalSuccessUrl,
        failUrl: finalFailUrl,
      });
    } catch (error: any) {
      console.error("결제 요청 실패:", error);
      console.error("에러 상세 정보:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status,
        name: error.name,
        stack: error.stack
      });
      
      if (error.code === "USER_CANCEL") {
        // 사용자가 결제를 취소한 경우
        sonnerToast.info("결제가 취소되었습니다.");
      } else {
        // 더 자세한 에러 메시지 표시
        let errorMessage = "결제 요청 중 오류가 발생했습니다.";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        }
        
        // 특정 에러에 대한 안내 메시지
        if (error.code === "23502" || error.message?.includes("null value")) {
          errorMessage = "결제 정보 저장 실패: 필수 필드가 누락되었습니다. Supabase 마이그레이션을 실행해주세요.";
        } else if (error.code === "23505" || error.message?.includes("unique")) {
          errorMessage = "결제 정보 저장 실패: 중복된 주문 번호입니다.";
        } else if (error.message?.includes("permission denied") || error.message?.includes("RLS")) {
          errorMessage = "결제 정보 저장 실패: 권한이 없습니다. RLS 정책을 확인해주세요.";
        }
        
        toast({
          title: "결제 요청 실패",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (authLoading) {
    return (
      <Button disabled className={className} size={size} variant={variant}>
        로딩 중...
      </Button>
    );
  }

  if (!clientKey) {
    return (
      <Button 
        disabled 
        className={className} 
        size={size} 
        variant={variant}
        title="환경 변수 VITE_TOSS_PAYMENTS_CLIENT_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요."
      >
        결제 시스템 설정 오류
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !tossPayments}
      className={className}
      size={size}
      variant={variant}
    >
      {isLoading ? "처리 중..." : children || "결제하기"}
    </Button>
  );
};

