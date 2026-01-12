export interface Hotspot {
    id: number;
    from_scene: number;
    to_scene: number | null;
    hotspot_type: 'scene' | 'info' | 'floor';
    to_scene_slug: string | null;
    to_scene_title: string | null;
    text: string;
    info_description: string;
    pitch: number;
    yaw: number;
}

export interface Scene {
    id: number;
    slug: string;
    title: string;
    description?: string;
    building: string;
    floor: number | null;
    floor_description: string;
    location_label: string;
    location: string;
    published_date: string;
    author?: string;
    panorama_image?: string; // URL
    thumbnail?: string;      // URL
    initial_pitch?: number;
    initial_yaw?: number;
    initial_fov?: number;
    is_featured: boolean;
    hotspots?: Hotspot[];
    created_at?: string;
}

export interface GroupedScenes {
    [building: string]: Scene[];
}
