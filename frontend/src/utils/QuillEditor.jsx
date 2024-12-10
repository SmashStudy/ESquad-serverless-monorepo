import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillEditor = ({ value = "", onChange, placeholder = "" }) => {
  return (
    <div>
      <style>
        {`
          .ql-editor img {
            max-width: 100%;
            height: auto;
            max-height: 500px;
          }
        `}
      </style>
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{
          toolbar: [
            ["bold", "italic", "strike"],
            ["link"],
            [{ color: [] }],
            ["blockquote"],
            ["code-block"],
            ["image"],
            [{ header: [1, 2, 3, false] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ size: ["small", "normal", "large", "huge"] }],
            ["clean"],
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
          "size",
        ]}
        style={{
          height: "700px",
          width: "100%",
          backgroundColor: "#fff",
        }}
      />
    </div>
  );
};

export default QuillEditor;
