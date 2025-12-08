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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Shield,
  Users,
  Building,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  getAdminSettingsData,
  updateAdminProfile,
  getAdminStats,
} from "./admin-settings-actions";

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

interface AdminStats {
  totalUsers: number;
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApplications: number;
}

interface AdminSettingsData {
  profile: Profile | null;
  stats?: AdminStats | null;
}

// --- KOMPONEN UTAMA ---

export function AdminSettingsForm() {
  const [data, setData] = useState<AdminSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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

        const [profileResult, statsResult] = await Promise.all([
          getAdminSettingsData(),
          getAdminStats(),
        ]);

        if (!profileResult.success || !profileResult.data) {
          throw new Error(profileResult.error || "Gagal memuat data pengaturan.");
        }

        const settingsData: AdminSettingsData = {
          profile: profileResult.data.profile,
          stats: statsResult.success ? statsResult.data : null,
        };
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
  }, []); // Dependency array kosong memastikan ini hanya berjalan sekali

  // Handler untuk memperbarui profil
  const handleProfileUpdate = async () => {
    if (!profileData.fullName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);
      const result = await updateAdminProfile({
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

  // --- Tampilan Loading dan Error ---

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted rounded-lg h-32"></div>
        <div className="animate-pulse bg-muted rounded-lg h-64"></div>
        <div className="text-center py-12 text-muted-foreground">
          Memuat data pengaturan...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tidak ada data tersedia.
      </div>
    );
  }

  const { profile, stats } = data;

  // --- Tampilan Utama ---

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Pengaturan Admin</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
        </TabsList>

        {/* Tab Profil Admin */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil Admin</CardTitle>
              <CardDescription>
                Perbarui informasi profil administrator Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Info Section */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{profile?.full_name || "Admin"}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="capitalize">
                      {profile?.role || "admin"}
                    </Badge>
                    <Badge variant="secondary">Administrator</Badge>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Email tidak dapat diubah"
                  />
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
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>

              {/* Account Info */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Informasi Akun</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>ID Administrator: {profile?.id}</p>
                  <p>
                    Bergabung sejak:{" "}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                  <p>
                    Terakhir diperbarui:{" "}
                    {profile?.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleProfileUpdate} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Ringkasan Sistem */}
        <TabsContent value="overview" className="space-y-4">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString('id-ID')}</div>
                  <p className="text-xs text-muted-foreground">
                    Pengguna terdaftar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Venue</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVenues.toLocaleString('id-ID')}</div>
                  <p className="text-xs text-muted-foreground">
                    Venue aktif
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString('id-ID')}</div>
                  <p className="text-xs text-muted-foreground">
                    Semua booking
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</div>
                  <p className="text-xs text-muted-foreground">
                    Dari booking yang dibayar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aplikasi Pending</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications.toLocaleString('id-ID')}</div>
                  <p className="text-xs text-muted-foreground">
                    Menunggu persetujuan
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  Gagal memuat data statistik.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}