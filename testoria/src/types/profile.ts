export interface ProfileType {
    _id: string;
    userId: string;
    photoUrl?: string;
    education?: string;
    certificates?: string[];
    bio?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProfileInput {
    photoUrl?: string;
    education?: string;
    certificates?: string[];
    bio?: string;
}