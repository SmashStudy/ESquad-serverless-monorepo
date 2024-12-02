import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import TeamCreationHorizontalLinerStepper from "./TeamCreationHorizontalLinerStepper.jsx";

const TeamCreationDialog = ({ open, onClose, teams, updateTeams, handleTab}) => {

    return (
        <Dialog open={open}
                onClose={onClose}
                maxWidth='md'
                fullWidth
        >
            <DialogContent>
                <TeamCreationHorizontalLinerStepper
                    onCancel={onClose}
                    teams={teams}
                    updateTeams={updateTeams}
                    handleTab={handleTab}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TeamCreationDialog;
