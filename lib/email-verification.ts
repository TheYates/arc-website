"use client";

// Email verification service
export interface VerificationToken {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

// Mock verification tokens storage
const mockTokens: VerificationToken[] = [];

export class EmailVerificationService {
  static async sendVerificationEmail(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate verification token
    const token = this.generateToken();
    const verificationToken: VerificationToken = {
      id: Date.now().toString(),
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      used: false,
    };

    mockTokens.push(verificationToken);

    // Mock sending email
    // Email verification token sent

    return { success: true };
  }

  static async verifyEmail(
    token: string
  ): Promise<{ success: boolean; email?: string; error?: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const verificationToken = mockTokens.find(
      (t) => t.token === token && !t.used
    );

    if (!verificationToken) {
      return { success: false, error: "Invalid or expired verification token" };
    }

    if (new Date() > new Date(verificationToken.expiresAt)) {
      return { success: false, error: "Verification token has expired" };
    }

    // Mark token as used
    verificationToken.used = true;

    return { success: true, email: verificationToken.email };
  }

  static async resendVerificationEmail(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    // Remove any existing unused tokens for this email
    const existingTokenIndex = mockTokens.findIndex(
      (t) => t.email === email && !t.used
    );
    if (existingTokenIndex !== -1) {
      mockTokens.splice(existingTokenIndex, 1);
    }

    return this.sendVerificationEmail(email);
  }

  private static generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
