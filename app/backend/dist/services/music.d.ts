export declare function search(query: string, type: string, limit: number): Promise<any>;
export declare function getArtist(artistId: string, userId?: string): Promise<any>;
export declare function getArtistAlbums(artistId: string): Promise<any>;
export declare function getSimilarArtists(artistId: string): Promise<any>;
export declare function getAlbum(albumId: string, userId?: string): Promise<any>;
export declare function getTrack(trackId: string, userId?: string): Promise<any>;
export declare function getChartArtists(): Promise<any>;
export declare function getChartTracks(): Promise<any>;
export declare function getMediaReviews(externalId: string, page: number, perPage: number): Promise<{
    data: ({
        user: {
            id: string;
            username: string;
            avatarUrl: string | null;
        };
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        externalId: string;
        rating: number;
        mediaType: import(".prisma/client").$Enums.MediaType;
        content: string;
        containsSpoiler: boolean;
        isFeatured: boolean;
    })[];
    total: number;
}>;
//# sourceMappingURL=music.d.ts.map