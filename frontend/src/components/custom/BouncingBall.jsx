import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const BouncingBall = () => {
  const ballRef = useRef();
  const containerRef = useRef();

  const randNum = (Math.random()*2)+1
  const randZero = Math.random() < 0.5 ? -1 : 1;

  const randNum2 = (Math.random()*2)+1
  const randZero2 = Math.random() < 0.5 ? -1 : 1;


  const velocity = useRef({ x: randNum*randZero, y: randNum2*randZero2 }); // 초기 속도
  const position = useRef({ x: 900, y: 500 }); // 초기 위치
  const acceleration = 0; // 속도 증가값

  useEffect(() => {
    const ball = ballRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const ballSize = ball.offsetWidth;

    const updatePosition = () => {
      // 위치 업데이트
      position.current.x += velocity.current.x;
      position.current.y += velocity.current.y;

      // 벽 충돌 감지 및 방향 반전
      if (
        position.current.x + ballSize >= containerRect.width || // 오른쪽 벽
        position.current.x <= 0 // 왼쪽 벽
      ) {
        velocity.current.x *= -1; // 방향 반전
        // velocity.current.x += velocity.current.x > 0 ? acceleration : -acceleration; // 속도 증가
      }

      if (
        position.current.y + ballSize >= containerRect.height || // 아래쪽 벽
        position.current.y <= 0 // 위쪽 벽
      ) {
        velocity.current.y *= -1; // 방향 반전
        // velocity.current.y += velocity.current.y > 0 ? acceleration : -acceleration; // 속도 증가
      }

      // 스타일 업데이트
      ball.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;

      // 다음 프레임 요청
      requestAnimationFrame(updatePosition);
    };

    // 애니메이션 시작
    requestAnimationFrame(updatePosition);

    return () => {
      // 클린업
      cancelAnimationFrame(updatePosition);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        width: "100%",
        height: "100vh",
        // backgroundColor: "grey.100",
        overflow: "hidden",
      }}
    >
      <Box
        ref={ballRef}
        sx={{
          position: "absolute",
          width: 150,
          height: 150,
          backgroundImage: "linear-gradient(to top right, #ECE0F8, #E0ECF8)",
          backgroundColor: "white",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          
        }}
      >
        <img
              src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-nbk.png"
              alt="Esquad Logo"
              style={{ 
                width: "150px", 
                height: "auto",
    
            }}
            />
      </Box>
    </Box>
  );
};

export default BouncingBall;
