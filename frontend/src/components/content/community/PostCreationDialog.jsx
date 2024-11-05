// PostCreationDialog.js
import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import PostCreationPage from '../../../pages/community/PostCreationPage.jsx';

const PostCreationDialog = ({ open, onClose, onPostCreated }) => {

    return (
        <Dialog open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
        >
            <DialogContent>
                {/* 게시글 작성 완료 시 onPostCreated 콜백을 호출 */}
                <PostCreationPage onCancel={onClose} onPostCreated={onPostCreated} />
            </DialogContent>
        </Dialog>
    );
};

export default PostCreationDialog;
