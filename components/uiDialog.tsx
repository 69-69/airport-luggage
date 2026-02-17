'use client';
import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
} from '@mui/material';


interface UIDialogProps {
    title: string;
    open: boolean;
    dialogWidth?: number;
    onCancel: () => void;
    optionLabel?: string;
    cancelLabel?: string;
    confirmLabel?: string;
    content: React.ReactNode;
    optDisabled?: boolean;
    confirmDisabled?: boolean;
    onOption?: () => void | Promise<void>;
    onConfirm?: () => void | Promise<void>;
}

const UiDialog = ({
                      open,
                      title,
                      dialogWidth,
                      onCancel,
                      content,
                      optionLabel,
                      cancelLabel,
                      confirmLabel,
                      onOption,
                      confirmDisabled,
                      optDisabled,
                      onConfirm,
                  }: UIDialogProps) => {

    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
    };

    const handleOptional = async () => {
        if (onOption) {
            await onOption();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                // Prevent closing when clicking outside or pressing Escape
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                onCancel(); // allow closing only via buttons
            }}
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
        >
            <DialogTitle id="dialog-title" align="center">{title}</DialogTitle>
            <DialogContent id="dialog-description"
                           sx={{display: 'flex', width: dialogWidth ?? 550, flexDirection: 'column', gap: 2, mt: 1}}>
                <Box sx={{flexGrow: 1}}></Box>
                {content}
            </DialogContent>
            <DialogActions sx={{mx: 2, my: 1}}>
                <Button onClick={onCancel} color="error" variant="outlined"
                        size="small" sx={{textTransform: 'none'}}>
                    {cancelLabel ?? 'No'}
                </Button>
                {optionLabel && (
                    <Button onClick={handleOptional} disabled={optDisabled}
                            size="small" variant="outlined"
                            color="inherit" sx={{textTransform: 'none'}}>
                        {optionLabel}
                    </Button>
                )}
                {confirmLabel != 'none' && (
                    <Button onClick={handleConfirm} disabled={confirmDisabled} size="small"
                            variant="outlined"
                            color="primary" sx={{textTransform: 'none'}}>
                        {confirmLabel ?? 'Yes, Confirm'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default UiDialog;
