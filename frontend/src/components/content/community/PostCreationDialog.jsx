// PostCreationDialog.js
import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import PostCreationPage from '../../../pages/community/PostCreationPage.jsx';

const PostCreationDialog = ({ open, onClose }) => {

    return (
        <Dialog open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
        >
            <DialogContent>
                <PostCreationPage onCancel={onClose} />
            </DialogContent>
        </Dialog>
    );
};

export default PostCreationDialog;
