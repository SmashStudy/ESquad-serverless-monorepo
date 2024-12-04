import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import TeamCreationHorizontalLinerStepper from "./TeamCreationHorizontalLinerStepper.jsx";

const TeamCreationDialog = ({ open, onClose, handleTab}) => {

    return (
        <Dialog open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
        >
            <DialogContent>
                <TeamCreationHorizontalLinerStepper
                    onCancel={onClose}
                    handleTab={handleTab}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TeamCreationDialog;
