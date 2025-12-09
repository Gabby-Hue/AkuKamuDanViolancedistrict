"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone } from "lucide-react";
import {
  getUserSettingsData,
  updateUserProfile,
} from "./user-settings-actions";

// --- TIPE DATA LOKAL ---

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserSettingsData {
  profile: Profile | null;
}

// --- KOMPONEN UTAMA ---

export function UserSettingsForm() {
  const [data, setData] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk form profil
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
  });

  // useEffect untuk mengambil data awal saat komponen dimuat
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const result = await getUserSettingsData();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Gagal memuat data pengaturan.");
        }

        const settingsData: UserSettingsData = result.data;
        setData(settingsData);

        // Inisialisasi form profil dari data yang diambil
        if (settingsData.profile) {
          setProfileData({
            fullName: settingsData.profile.full_name || "",
            phone: settingsData.profile.phone || "",
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal memuat data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handler untuk memperbarui profil
  const handleProfileUpdate = async () => {
    if (!profileData.fullName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);
      const result = await updateUserProfile({
        fullName: profileData.fullName || undefined,
        phone: profileData.phone || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui profil.");
      }

      toast.success("Profil berhasil diperbarui");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui profil",
      );
    } finally {
      setSaving(false);
    }
  };

  // --- Tampilan Loading ---

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full md:col-span-2" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-9 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-muted-foreground">
        Tidak ada data tersedia.
      </div>
    );
  }

  const { profile } = data;

  // --- Tampilan Utama ---

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-16">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pengaturan Profil
          </h1>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>
            Perbarui data profil agar akun Anda tetap up to date.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Profile Info Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-muted/60 border border-dashed border-border/60">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-primary">
                {profile?.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : "U"}
              </span>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-base">
                  {profile?.full_name || "User"}
                </h3>
                {profile?.role && (
                  <Badge variant="outline" className="rounded-full text-xs">
                    {profile.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {profile?.email || "Email belum tersedia"}
              </p>
              {profile?.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                disabled={saving}
                placeholder="Masukkan nama lengkap"
              />
              <p className="text-xs text-muted-foreground">
                Nama ini akan tampil di seluruh aplikasi.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                type="email"
                className="bg-muted/60"
                placeholder="Email tidak dapat diubah"
              />
              <p className="text-xs text-muted-foreground">
                Email digunakan untuk login dan keperluan notifikasi.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nomor Telepon
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                disabled={saving}
                placeholder="Contoh: 081234567890"
              />
              <p className="text-xs text-muted-foreground">
                Opsional, tapi membantu jika kami perlu menghubungi Anda.
              </p>
            </div>
          </div>

          <Separator />

          {/* Account Info */}
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Informasi Akun</h4>
            <div className="grid gap-2 md:grid-cols-2 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  ID Pengguna:
                </span>{" "}
                {profile?.id}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Bergabung sejak:
                </span>{" "}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="md:col-span-2">
                <span className="font-medium text-foreground">
                  Terakhir diperbarui:
                </span>{" "}
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleProfileUpdate}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
