import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import StudyCreationPage from "../../pages/team/study/StudyCreationPage.jsx";

const StudyCreatgionDialog = ({ open, onClose, selectedTeamId, selectedBook }) => {

    return (
        <Dialog open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
        >
            <DialogContent>
                <StudyCreationPage
                    onCancel={onClose}
                    selectedTeamId={selectedTeamId}
                    selectedBook={selectedBook}
                />
            </DialogContent>
        </Dialog>
    );
};

export default StudyCreatgionDialog;
