'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SceneRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Force redirect to main tour page to avoid indexing individual slug pages
        router.replace('/tour');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <p>Mengarahkan ke Tur Utama...</p>
        </div>
    );
}
