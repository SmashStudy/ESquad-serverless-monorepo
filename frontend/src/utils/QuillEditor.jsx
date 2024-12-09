import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

// 폰트 크기 옵션 추가
const FontSize = Quill.import("formats/size");
FontSize.whitelist = ["small", "normal", "large", "huge"]; // 허용할 폰트 크기 목록
Quill.register(FontSize, true);

const QuillEditor = ({ value = "", onChange, placeholder = "" }) => {
  return (
    <div>
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{
          toolbar: [
            ["bold", "italic", "strike"], // 텍스트 포맷 옵션
            ["link"], // 링크 삽입
            [{ color: [] }], // 텍스트 색상 선택기
            ["blockquote"], // 인용구
            ["code-block"], // 코드 블록
            ["image"], // 이미지 삽입
            [{ header: [1, 2, 3, false] }], // 헤더 1, 2, 3
            [{ list: "ordered" }, { list: "bullet" }], // 번호 목록, 글머리 기호
            [{ size: ["small", "normal", "large", "huge"] }], // 폰트 크기 추가
            ["clean"], // 서식 제거
          ],
        }}
        formats={[
          "bold",
          "italic",
          "strike",
          "link",
          "color",
          "blockquote",
          "code-block",
          "image",
          "header",
          "list",
          "size", // 폰트 크기 포맷 추가
        ]}
        style={{
          height: "600px",
          width: "100%",
          backgroundColor: "#fff",
        }}
      />
    </div>
  );
};

export default QuillEditor;
