"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { hideModal } from "@/store/slices/uiSlice";

export function ModalHost() {
    const dispatch = useAppDispatch();
    const { open, title, description, variant } = useAppSelector(
        (state) => state.ui.modal
    );

    if (!open) return null;

    return (
        <div className="modal-host" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal__header">
                    <p className="modal__title">{title}</p>
                </div>
                {description && <p className="modal__description">{description}</p>}
                <div className="modal__footer">
                    {variant === "confirm" && (
                        <button
                            className="btn btn--secondary"
                            onClick={() => dispatch(hideModal())}
                        >
                            Cancel
                        </button>
                    )}
                    <button className="btn" onClick={() => dispatch(hideModal())}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
