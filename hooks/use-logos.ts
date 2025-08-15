import { useState, useEffect, useCallback } from "react";
import { Logo, CreateLogoRequest, UpdateLogoRequest, LogoResponse, LogoUploadResponse } from "@/lib/types/logos";

export function useLogos(activeOnly: boolean = false) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = activeOnly ? "/api/admin/logos?active=true" : "/api/admin/logos";
      const response = await fetch(url);
      const data: LogoResponse = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setLogos(data.data);
      } else {
        setError(data.error || "Failed to fetch logos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logos");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  const createLogo = async (logoData: CreateLogoRequest): Promise<{ success: boolean; error?: string; data?: Logo }> => {
    try {
      let logoSrc = "";
      
      // Upload file if provided
      if (logoData.file) {
        const uploadResult = await uploadFile(logoData.file);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }
        logoSrc = uploadResult.url!;
      }
      
      const response = await fetch("/api/admin/logos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...logoData,
          src: logoSrc,
        }),
      });
      
      const data: LogoResponse = await response.json();
      
      if (data.success && data.data && !Array.isArray(data.data)) {
        await fetchLogos(); // Refresh the list
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error || "Failed to create logo" };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create logo" };
    }
  };

  const updateLogo = async (logoData: UpdateLogoRequest): Promise<{ success: boolean; error?: string; data?: Logo }> => {
    try {
      let updateData = { ...logoData };
      
      // Upload new file if provided
      if (logoData.file) {
        const uploadResult = await uploadFile(logoData.file);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }
        updateData.src = uploadResult.url!;
      }
      
      const response = await fetch("/api/admin/logos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      const data: LogoResponse = await response.json();
      
      if (data.success && data.data && !Array.isArray(data.data)) {
        await fetchLogos(); // Refresh the list
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error || "Failed to update logo" };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update logo" };
    }
  };

  const deleteLogo = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/logos?id=${id}`, {
        method: "DELETE",
      });
      
      const data: LogoResponse = await response.json();
      
      if (data.success) {
        await fetchLogos(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to delete logo" };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete logo" };
    }
  };

  const uploadFile = async (file: File): Promise<LogoUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/admin/logos/upload", {
        method: "POST",
        body: formData,
      });
      
      return await response.json();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to upload file",
      };
    }
  };

  const reorderLogos = async (reorderedLogos: Logo[]): Promise<{ success: boolean; error?: string }> => {
    try {
      // Update sort orders
      const updates = reorderedLogos.map((logo, index) => ({
        id: logo.id!,
        sortOrder: index + 1,
      }));
      
      // Send batch update
      const promises = updates.map(update => 
        fetch("/api/admin/logos", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        })
      );
      
      await Promise.all(promises);
      await fetchLogos(); // Refresh the list
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to reorder logos" };
    }
  };

  return {
    logos,
    isLoading,
    error,
    fetchLogos,
    createLogo,
    updateLogo,
    deleteLogo,
    reorderLogos,
  };
}
