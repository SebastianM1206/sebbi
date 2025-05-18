"use client";

import * as React from "react"
import {
    PlusCircle,
    FileText,
    Library,
    MessageSquare,
    Gift,
    Video,
    HelpCircle,
    Keyboard,
    Monitor,
    Sun,
    Moon,
    Zap
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarSeparator
} from "@/components/ui/sidebar"

export default function SidebarComponent() {
    const [uploadProgress, setUploadProgress] = React.useState(10);

    return (
        <Sidebar className="border-r border-gray-200 bg-white w-64 shadow-sm overflow-hidden">
            <SidebarHeader className="p-4 flex items-center gap-3 border-b border-gray-100">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-gray-100 text-gray-800 text-sm">AM</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900">Alfonso Murillo</span>

            </SidebarHeader>

            <SidebarContent className="py-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full px-4 py-2.5 justify-start gap-3 hover:bg-gray-50">
                            <PlusCircle className="h-[18px] w-[18px] text-indigo-600" />
                            <span className="text-indigo-600 font-medium">New</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full px-4 py-2.5 justify-start gap-3 hover:bg-gray-50">
                            <FileText className="h-[18px] w-[18px] text-gray-500" />
                            <span className="text-gray-700">Documents</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full px-4 py-2.5 justify-start gap-3 hover:bg-gray-50">
                            <Library className="h-[18px] w-[18px] text-gray-500" />
                            <span className="text-gray-700">Library</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full px-4 py-2.5 justify-start gap-3 hover:bg-gray-50">
                            <MessageSquare className="h-[18px] w-[18px] text-gray-500" />
                            <span className="text-gray-700">AI Chat</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="py-24"></div>


            </SidebarContent>

        </Sidebar>
    );
}
