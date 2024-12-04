import React from 'react';

const FilePreviewBeforeUpload = ({file, maxWidth= 200, maxHeight = 200, width = 100}) => {
  const isImage = file && file.type.startsWith('image/');

  return (
      <div className="file-preview">
        {isImage ? (
            <img
                src={URL.createObjectURL(file)}
                alt="사진 미리보기"
                style={{maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px`, width: `${width}%`}}
            />
        ) : (
            <p>미리보기가 지원되지 않는 파일 형식</p>
        )}
      </div>
  )
}
export default FilePreviewBeforeUpload;
