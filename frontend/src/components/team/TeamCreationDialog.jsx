import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import TeamCreationHorizontalLinerStepper from "./TeamCreationHorizontalLinerStepper.jsx";

const TeamCreationDialog = ({ open, onClose, onTabChange}) => {

    return (
        <Dialog open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
        >
            <DialogContent>
                <TeamCreationHorizontalLinerStepper
                    onCancel={onClose}
                    onTabChange={onTabChange}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TeamCreationDialog;
