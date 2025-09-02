import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, User, UserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { authenticatedGet, authenticatedPost } from "@/lib/api/auth-headers";

// Query Keys for Users
export const adminUserQueryKeys = {
  users: {
    all: ['admin', 'users'] as const,
    lists: () => [...adminUserQueryKeys.users.all, 'list'] as const,
    list: (filters?: { role?: string; search?: string }) => 
      [...adminUserQueryKeys.users.lists(), filters] as const,
    details: () => [...adminUserQueryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...adminUserQueryKeys.users.details(), id] as const,
  },
} as const;

// Fetch all users
async function fetchUsers(user: User | null): Promise<User[]> {
  if (!user) throw new Error("User not authenticated");
  
  const response = await authenticatedGet("/api/admin/users", user);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  
  const data = await response.json();
  return data.users || [];
}

// Create user
async function createUser(user: User | null, userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
}): Promise<User> {
  if (!user) throw new Error("User not authenticated");
  
  const response = await authenticatedPost("/api/admin/users", user, userData);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create user");
  }
  
  const data = await response.json();
  return data.user;
}

// Update user
async function updateUser(userId: string, userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
}): Promise<User> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user");
  }
  
  const data = await response.json();
  return data.user;
}

// Delete user
async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete user");
  }
}

// Reset user password
async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPassword }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reset password");
  }
}

// Users Query Hook
export function useUsers(filters?: { role?: string; search?: string }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: adminUserQueryKeys.users.list(filters),
    queryFn: () => fetchUsers(user),
    enabled: !!user,
    select: (data) => {
      let filteredUsers = data;
      
      // Apply role filter
      if (filters?.role && filters.role !== "all") {
        filteredUsers = filteredUsers.filter(u => u.role === filters.role);
      }
      
      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.firstName.toLowerCase().includes(searchTerm) ||
          u.lastName.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredUsers;
    },
  });
}

// User Mutations Hook
export function useUserMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      role: UserRole;
    }) => createUser(user, userData),
    onSuccess: (newUser) => {
      // Add to cache
      queryClient.setQueryData(
        adminUserQueryKeys.users.lists(),
        (oldData: User[] | undefined) => {
          return oldData ? [...oldData, newUser] : [newUser];
        }
      );
      
      // Invalidate to refetch with filters
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.users.lists() });
      
      toast({
        title: "User Created",
        description: `${newUser.firstName} ${newUser.lastName} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating User",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: {
      userId: string;
      userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        role: UserRole;
      };
    }) => updateUser(userId, userData),
    onSuccess: (updatedUser, variables) => {
      // Update in cache
      queryClient.setQueryData(
        adminUserQueryKeys.users.lists(),
        (oldData: User[] | undefined) => {
          return oldData?.map(user => 
            user.id === variables.userId ? updatedUser : user
          ) || [];
        }
      );
      
      // Invalidate to refetch with filters
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.users.lists() });
      
      toast({
        title: "User Updated",
        description: `${updatedUser.firstName} ${updatedUser.lastName} has been updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating User",
        description: error instanceof Error ? error.message : "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.setQueryData(
        adminUserQueryKeys.users.lists(),
        (oldData: User[] | undefined) => {
          return oldData?.filter(user => user.id !== userId) || [];
        }
      );
      
      // Invalidate to refetch with filters
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.users.lists() });
      
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting User",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) => 
      resetUserPassword(userId, newPassword),
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "User password has been reset successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Resetting Password",
        description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    resetPassword: resetPasswordMutation,
    
    // Loading states
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}
