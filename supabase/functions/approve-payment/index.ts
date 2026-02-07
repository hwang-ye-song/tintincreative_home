// Supabase Edge Function: 토스 페이먼츠 결제 승인 처리
// 시크릿 키는 Supabase 대시보드의 환경 변수에 설정해야 합니다.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("환경변수 누락: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY 확인");
      return new Response(JSON.stringify({ error: "서버 설정 오류" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 인증용 anon 클라이언트 (사용자 토큰 검증)
    const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // 서비스 롤 클라이언트 (RLS 우회 DB 업데이트)
    const supabaseServiceClient = createClient(supabaseUrl, serviceRoleKey);

    // 요청 본문 파싱
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return new Response(
        JSON.stringify({ error: "필수 파라미터가 누락되었습니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 사용자 인증 확인
    const { data: authData, error: authError } = await supabaseAuthClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "인증이 필요합니다." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 토스 페이먼츠 시크릿 키 (환경 변수에서 가져옴)
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    if (!tossSecretKey) {
      console.error("TOSS_PAYMENTS_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
      return new Response(
        JSON.stringify({ error: "서버 설정 오류" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DB에서 주문 조회 (서비스 롤, RLS 우회) - 금액/상태 검증
    const { data: paymentData, error: paymentError } = await supabaseServiceClient
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (paymentError || !paymentData) {
      console.error("결제 정보 조회 실패:", paymentError);
      return new Response(JSON.stringify({ error: "결제 정보를 찾을 수 없습니다." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 상태 검증: 이미 완료된 결제면 중복 승인 방지
    if (paymentData.status === "completed") {
      return new Response(JSON.stringify({ error: "이미 완료된 결제입니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 금액 검증: 요청 금액과 DB 금액이 불일치하면 거부
    const dbAmount = Number(paymentData.amount || 0);
    if (Number(amount) !== dbAmount) {
      console.error("금액 불일치: 요청:", amount, "DB:", dbAmount);
      return new Response(JSON.stringify({ error: "결제 금액이 일치하지 않습니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 토스 페이먼츠 결제 승인 API 호출
    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(tossSecretKey + ":")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error("토스 페이먼츠 결제 승인 실패:", tossData);
      return new Response(
        JSON.stringify({ 
          error: tossData.message || "결제 승인 실패",
          details: tossData 
        }),
        {
          status: tossResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 결제 승인 성공 → DB 업데이트 (서비스 롤)
    const { error: updateError } = await supabaseServiceClient
      .from("payments")
      .update({
        status: "completed",
        payment_key: paymentKey,
        payment_method: tossData.method || null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("결제 정보 업데이트 실패:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        payment: tossData,
        orderId 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge Function 오류:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

