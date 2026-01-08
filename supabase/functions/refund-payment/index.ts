// Supabase Edge Function: 토스 페이먼츠 환불 처리
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
    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 사용자 인증 확인
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "인증이 필요합니다." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return new Response(
        JSON.stringify({ error: "관리자 권한이 필요합니다." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 요청 본문 파싱
    const { paymentKey, cancelReason, cancelAmount } = await req.json();

    if (!paymentKey) {
      return new Response(
        JSON.stringify({ error: "paymentKey가 필요합니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 토스 페이먼츠 시크릿 키 가져오기
    const secretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");

    if (!secretKey) {
      console.error("TOSS_PAYMENTS_SECRET_KEY가 설정되지 않았습니다.");
      return new Response(
        JSON.stringify({ error: "서버 설정 오류" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 환불 요청 본문 구성
    const cancelBody: any = {
      cancelReason: cancelReason || "관리자 환불 처리",
    };

    // 부분 환불인 경우 cancelAmount 추가
    if (cancelAmount && cancelAmount > 0) {
      cancelBody.cancelAmount = cancelAmount;
    }

    // 토스 페이먼츠 API로 환불 요청
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${secretKey}:`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cancelBody),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("토스 페이먼츠 환불 실패:", result);
      return new Response(
        JSON.stringify({
          error: result.message || "환불 처리에 실패했습니다.",
          details: result,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("환불 처리 중 오류:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "환불 처리 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

