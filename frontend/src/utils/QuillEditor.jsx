import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillEditor = ({ value = "", onChange, placeholder = "" }) => {
  return (
    <ReactQuill
      value={value || ""} // value가 null이나 undefined일 경우 빈 문자열로 대체
      onChange={(content) => onChange(content)} // 변경된 내용 전달
      placeholder={placeholder} // 플레이스홀더
      modules={{
        toolbar: [
          ["bold", "italic", "underline", "strike"], // 텍스트 포맷 옵션
          [{ list: "ordered" }, { list: "bullet" }], // 리스트 옵션
          ["link", "image"], // 링크 및 이미지 삽입
          ["clean"], // 서식 제거
        ],
      }}
      formats={[
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "link",
        "image",
      ]}
      style={{
        height: "300px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    />
  );
};

export default QuillEditor;
