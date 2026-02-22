import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CheckSquare,
    Trash2,
    UserPlus,
    ArrowRightCircle,
    MoreHorizontal,
    X,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onAssignTo: () => void;
    onChangeStatus: (status: string) => void;
    onDelete: () => void;
    isProcessing?: boolean;
}

const BulkActionToolbar = ({
    selectedCount,
    onClearSelection,
    onAssignTo,
    onChangeStatus,
    onDelete,
    isProcessing = false,
}: BulkActionToolbarProps) => {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 min-w-[320px] sm:min-w-[500px]"
            >
                <div className="flex items-center gap-2 border-r border-white/20 pr-4">
                    <div className="bg-amber-500 text-black font-bold h-6 w-6 rounded flex items-center justify-center text-xs">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium">Selected</span>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10 hover:text-amber-400 h-8 px-2"
                        onClick={onAssignTo}
                        disabled={isProcessing}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Assign</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/10 hover:text-amber-400 h-8 px-2"
                                disabled={isProcessing}
                            >
                                <ArrowRightCircle className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Status</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuLabel>Change Status To</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onChangeStatus("pending")}>
                                Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeStatus("acknowledged")}>
                                Acknowledged
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeStatus("in_progress")}>
                                In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeStatus("completed")}>
                                Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeStatus("closed")}>
                                Closed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onChangeStatus("rejected")}
                                className="text-red-500 focus:text-red-500"
                            >
                                Rejected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:bg-red-500/20 hover:text-red-200 h-8 px-2"
                        onClick={onDelete}
                        disabled={isProcessing}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>

                <div className="border-l border-white/20 pl-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={onClearSelection}
                        disabled={isProcessing}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-50">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default BulkActionToolbar;
