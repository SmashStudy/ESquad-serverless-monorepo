import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillEditor = ({ value = "", onChange, placeholder = "" }) => {
  return (
    <ReactQuill
      value={value || ""} // null이나 undefined를 방지
      onChange={(content) => onChange(content)} // 변경된 내용 전달
      placeholder={placeholder}
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
        height: "400px",
        width: "100%",
        backgroundColor: "#fff",
        padding: "10px", // 내부 패딩 추가
        border: "none", // 내부 테두리 제거
      }}
    />
  );
};

export default QuillEditor;
