import * as React from "react";
import { IconX } from "@tabler/icons-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all sm:my-8"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
            >
                <div className="absolute top-0 right-0 pt-5 pr-5">
                    <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        onClick={onClose}
                    >
                        <span className="sr-only">Cerrar modal</span>
                        <IconX className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="px-6 py-6 sm:p-8">
                    <div className="sm:flex sm:items-start mb-6">
                        <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                            <h3 className="text-xl font-bold leading-6 text-gray-900" id="modal-headline">
                                {title}
                            </h3>
                        </div>
                    </div>

                    <div className="mt-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
