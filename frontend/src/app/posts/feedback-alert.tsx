"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function FeedbackAlert({ message }: { message: string }) {
    const router = useRouter();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const hideTimeout = window.setTimeout(() => {
            setVisible(false);
        }, 3000);
        const cleanUrlTimeout = window.setTimeout(() => {
            router.replace("/posts", { scroll: false });
        }, 3350);

        return () => {
            window.clearTimeout(hideTimeout);
            window.clearTimeout(cleanUrlTimeout);
        };
    }, [router]);

    return (
        <div
            role="status"
            aria-live="polite"
            className={`alert alert-success mb-4 transition-all duration-300 ease-out ${visible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 max-h-0 overflow-hidden opacity-0 !py-0"
                }`}
        >
            <span>✓</span>
            <p>{message}</p>
        </div>
    );
}
