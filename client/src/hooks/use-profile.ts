import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { get, post, put, del } from "@/lib/axiosClient";
import { UserProfile } from "@/types/schema";
import { IAddress } from "@/types/address";

interface ProfileFormValues {
    fullName?: string;
    phone?: string;
    gender?: string;
}

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const profileData = await get<UserProfile>('user-profile/profile');
            setProfile(profileData);
            setError(null);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err as Error);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfileInfo = async (data: ProfileFormValues) => {
        if (!profile) throw new Error("Profile not loaded");
        try {
            await put('user-profile/profile', data);
            await fetchProfile();
            return true;
        } catch (err) {
            console.error("Error updating profile info:", err);
            setError(err as Error);
            throw err;
        }
    };

    const addAddress = async (addressData: Omit<IAddress, '_id' | 'index'>) => {
        try {
            await post('/user-profile/addresses', addressData);
            await fetchProfile();
            return true;
        } catch (err) {
            console.error("Error adding address:", err);
            setError(err as Error);
            throw err;
        }
    };

    const updateAddress = async (addressIndex: number, addressData: Partial<IAddress>) => {
        try {
            await put(`/user-profile/addresses/${addressIndex}`, addressData);
            await fetchProfile();
            return true;
        } catch (err) {
            console.error("Error updating address:", err);
            setError(err as Error);
            throw err;
        }
    };

    const deleteAddress = async (addressIndex: number) => {
        try {
            await del(`/user-profile/addresses/${addressIndex}`);
            await fetchProfile();
            return true;
        } catch (err) {
            console.error("Error deleting address:", err);
            setError(err as Error);
            throw err;
        }
    };

    const setDefaultAddress = async (addressIndex: number) => {
        try {
            await put(`/user-profile/addresses/${addressIndex}/default`, {});
            await fetchProfile();
            return true;
        } catch (err) {
            console.error("Error setting default address:", err);
            setError(err as Error);
            throw err;
        }
    };

    return {
        profile,
        addresses: profile?.address || [],
        isLoading,
        error,
        fetchProfile,
        updateProfileInfo,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    };
} 