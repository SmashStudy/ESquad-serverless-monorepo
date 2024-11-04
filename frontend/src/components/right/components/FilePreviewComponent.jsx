import React from 'react';

const FilePreviewComponent = ({file}) => {
    const isImage = file && file.type.startsWith('image/');

    return (
        <div className="file-preview">
            {isImage? (
                <img
                    src={URL.createObjectURL(file)}
                    alt="사진 미리보기"
                    style={{ maxWidth: '200px', maxHeight: '200px', margin: '10px 0' }}
                />
            ) : (
                <p>미리보기가 지원되지 않는 파일 형식</p>
            )}
        </div>
    )
}
export default FilePreviewComponent;