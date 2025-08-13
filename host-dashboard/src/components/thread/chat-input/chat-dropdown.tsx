import React, { useState } from 'react'
import { ChevronDown, User, LogIn, Lock, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

const ChatDropdown = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 px-3 py-1 h-8 text-sm font-medium hover:bg-accent rounded-lg"
                >
                    <Bot size={16} className="text-primary" />
                    <span>Krib AI</span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-64 p-0 border"
                sideOffset={4}
            >
                <DropdownMenuItem
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent border-b m-0"
                    style={{
                        borderRadius: '0'
                    }}
                >
                    <User size={18} />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Krib AI</span>
                        <span className="text-xs text-muted-foreground">Default</span>
                    </div>
                </DropdownMenuItem>

                <div className="relative">
                    {/* Overlay like the upgrade component */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center">
                        <div className="w-full p-3">
                            <div className="rounded-xl bg-gradient-to-br from-slate-50/80 to-slate-100/70 dark:from-slate-900/40 dark:to-slate-800/30 shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-3">
                                <div className="flex items-center justify-center">
                                    <Lock className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                                    <p className="text-sm font-medium">Login to explore all agents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ChatDropdown