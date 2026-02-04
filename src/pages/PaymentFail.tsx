import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    if (errorCode === "USER_CANCEL") return "결제가 취소되었습니다.";
    return "결제 처리 중 오류가 발생했습니다.";
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>결제 실패 - 결제 오류</title>
        <meta name="description" content="결제 처리 중 오류가 발생했습니다." />
      </Helmet>
      <Navbar />

      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-700">
                결제에 실패했습니다
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {getErrorMessage()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderId && (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">주문 번호</span>
                    <span className="font-mono text-sm">{orderId}</span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>문제가 계속되나요?</strong>
                  <br />
                  고객센터로 문의해주시면 빠르게 도와드리겠습니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => window.history.back()}
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
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

export default PaymentFail;

