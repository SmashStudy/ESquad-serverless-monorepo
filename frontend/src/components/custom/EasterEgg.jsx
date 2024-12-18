import { useEffect, useRef } from "react";

const useKonamiCode = (callback) => {
  const konamiSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  const inputSequenceRef = useRef([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      inputSequenceRef.current = [
        ...inputSequenceRef.current,
        event.key,
      ].slice(-konamiSequence.length);

      if (inputSequenceRef.current.join("") === konamiSequence.join("")) {
        callback(); // 콜백 함수 실행
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback]); // callback 의존성 추가

  // Hook은 값을 반환하지 않음 (필요 시 확장 가능)
};

export default useKonamiCode;
