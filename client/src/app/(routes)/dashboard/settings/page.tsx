"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, Trash2, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { useZustandStore } from "@/zustand/store";

interface UserSettings {
  profile: {
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  subscription: {
    plan: string;
    status: string;
    startDate?: string;
    endDate?: string;
  };
  emailLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    dailyUsed: number;
    monthlyUsed: number;
  };
  preferences: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
  };
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch settings");
  }
  return data.settings;
};

export default function SettingsPage() {
  const { setUserData } = useZustandStore();
  const {
    data: settings,
    error,
    mutate,
    isLoading,
  } = useSWR<UserSettings | null, Error>("/api/settings", fetcher);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  useEffect(() => {
    if (settings) {
      setProfileData({
        name: settings.profile.name,
        email: settings.profile.email,
      });
      setPreferences(settings.preferences);
    }
  }, [settings]);

  useEffect(() => {
    if (error) toast(error.message);
  }, [error]);

  const updateProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (response.ok) {
        toast("Profile updated successfully!");
        setUserData(data.user);
        await mutate(); 
      } else {
        toast(data.error || "Failed to update profile");
      }
    } catch {
      toast("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast("New passwords don't match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast("Password updated successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        await mutate();
      } else {
        toast(data.error || "Failed to update password");
      }
    } catch {
      toast("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const data = await response.json();
      if (response.ok) {
        toast("Preferences updated successfully!");
        await mutate();
      } else {
        toast(data.error || "Failed to update preferences");
      }
    } catch {
      toast("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch("/api/settings/delete-account", {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        toast("Account deleted successfully");
        window.location.href = "/";
      } else {
        toast(data.error || "Failed to delete account");
      }
    } catch {
      toast("Failed to delete account");
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500";
      case "pro":
        return "bg-purple-500";
      case "premium":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gap-x-2 app-gradient flex items-center justify-center p-4">
        <p>
          <Loader2 className="animate-spin" />
        </p>
        <div className="text-foreground">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen app-gradient flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            Failed to Load Settings
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Unable to load your settings. Please try again.
          </p>
          <Button onClick={() => mutate()} className="w-full sm:w-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:p-6 lg:pt-10 flex justify-center">
      <div className="max-w-7xl w-full">
        <div>
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 sm:h-16 items-center px-4 sm:px-6">
              <div className="flex items-center justify-between w-full ml-4">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                    Settings
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Email
                      </span>
                    </div>
                    <p className="font-medium text-sm sm:text-base break-all">
                      {settings.profile.email}
                    </p>
                    <Badge
                      variant={
                        settings.profile.isVerified ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {settings.profile.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Plan
                      </span>
                    </div>
                    <p className="font-medium text-sm sm:text-base capitalize">
                      {settings.subscription.plan}
                    </p>
                    <Badge
                      className={`${getPlanColor(
                        settings.subscription.plan
                      )} text-white text-xs`}
                    >
                      {settings.subscription.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Account created
                      </span>
                    </div>
                    <p className="font-medium text-sm sm:text-base">
                      {new Date(
                        settings.profile.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                      className="text-sm"
                    />
                  </div>
                </div>
                {(settings.profile.email !== profileData.email ||
                  settings.profile.name !== profileData.name) && (
                  <Button
                    onClick={updateProfile}
                    disabled={saving}
                    className="w-full sm:w-auto text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-background/60 hidden backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      className="text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                      className="text-sm"
                    />
                  </div>
                </div>
                <Button
                  onClick={updatePassword}
                  disabled={saving}
                  className="w-full sm:w-auto text-sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Email Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Usage</span>
                      <span>
                        {settings.emailLimits.dailyUsed} /{" "}
                        {settings.emailLimits.dailyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (settings.emailLimits.dailyUsed /
                              settings.emailLimits.dailyLimit) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Usage</span>
                      <span>
                        {settings.emailLimits.monthlyUsed} /{" "}
                        {settings.emailLimits.monthlyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (settings.emailLimits.monthlyUsed /
                              settings.emailLimits.monthlyLimit) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 hidden backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        Email Notifications
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive notifications about your email campaigns
                      </p>
                    </div>
                    <Button
                      variant={
                        preferences.emailNotifications ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          emailNotifications: !preferences.emailNotifications,
                        })
                      }
                      className="w-full sm:w-auto text-xs"
                    >
                      {preferences.emailNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        Marketing Emails
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive updates about new features and promotions
                      </p>
                    </div>
                    <Button
                      variant={
                        preferences.marketingEmails ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          marketingEmails: !preferences.marketingEmails,
                        })
                      }
                      className="w-full sm:w-auto text-xs"
                    >
                      {preferences.marketingEmails ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        Security Alerts
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive alerts about account security events
                      </p>
                    </div>
                    <Button
                      variant={
                        preferences.securityAlerts ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          securityAlerts: !preferences.securityAlerts,
                        })
                      }
                      className="w-full sm:w-auto text-xs"
                    >
                      {preferences.securityAlerts ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={updatePreferences}
                  disabled={saving}
                  className="w-full sm:w-auto text-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2 text-lg sm:text-xl">
                  Account Closure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-red-200 dark:border-red-800 mb-4">
                  <AlertDescription className="text-red-600 text-sm">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </AlertDescription>
                </Alert>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base sm:text-lg">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers including:
                        <br />• All your API keys
                        <br />• Email history and logs
                        <br />• Subscription data
                        <br />• Account preferences
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto text-sm">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteAccount}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
