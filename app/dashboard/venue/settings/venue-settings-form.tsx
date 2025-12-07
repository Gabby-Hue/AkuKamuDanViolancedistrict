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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapSelector } from "@/components/ui/map-selector";
import { Building2 } from "lucide-react";
import {
  getVenueSettingsData,
  updateProfile,
  updateVenue,
} from "./venue-settings-actions";

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

interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  facility_types: string[];
  facility_count: number | null;
  website: string | null;
  business_license_url: string | null;
  venue_status: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface VenueSettingsData {
  profile: Profile | null;
  venue: Venue | null;
  courts?: any[];
  message?: string;
}

// --- KOMPONEN UTAMA ---

export function VenueSettingsForm() {
  const [data, setData] = useState<VenueSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // State untuk form profil
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
  });

  // State untuk form venue
  const [venueData, setVenueData] = useState({
    name: "",
    city: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
  });

  // State untuk koordinat peta
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // useEffect untuk mengambil data awal saat komponen dimuat
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const result = await getVenueSettingsData();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Gagal memuat data pengaturan.");
        }

        const settingsData: VenueSettingsData = result.data;
        setData(settingsData);

        // Inisialisasi form profil dari data yang diambil
        if (settingsData.profile) {
          setProfileData({
            fullName: settingsData.profile.full_name || "",
            phone: settingsData.profile.phone || "",
          });
        }

        // Inisialisasi form venue dari data yang diambil
        if (settingsData.venue) {
          setVenueData({
            name: settingsData.venue.name || "",
            city: settingsData.venue.city || "",
            address: settingsData.venue.address || "",
            contactPhone: settingsData.venue.contactPhone || "",
            contactEmail: settingsData.venue.contactEmail || "",
            description: settingsData.venue.description || "",
          });

          // Inisialisasi koordinat jika ada
          if (settingsData.venue.latitude && settingsData.venue.longitude) {
            setCoordinates({
              latitude: settingsData.venue.latitude,
              longitude: settingsData.venue.longitude,
            });
          }
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
      const result = await updateProfile({
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

  // Handler untuk memperbarui info venue
  const handleVenueUpdate = async () => {
    if (!venueData.name.trim()) {
      toast.error("Nama venue tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        name: venueData.name,
        city: venueData.city || null,
        address: venueData.address || null,
        contactPhone: venueData.contactPhone || null,
        contactEmail: venueData.contactEmail || null,
        description: venueData.description || null,
      };

      // Tambahkan koordinat jika ada
      if (coordinates) {
        updateData.latitude = coordinates.latitude;
        updateData.longitude = coordinates.longitude;
      }

      const result = await updateVenue(updateData);

      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui venue.");
      }

      toast.success("Informasi venue berhasil diperbarui");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui venue",
      );
    } finally {
      setSaving(false);
    }
  };

  // --- Tampilan Loading dan Error ---

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="animate-pulse bg-muted rounded-lg h-32"></div>
          <div className="animate-pulse bg-muted rounded-lg h-64"></div>
        </div>
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

  const { profile, venue } = data;

  // --- Tampilan Utama ---

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="venue">Venue</TabsTrigger>
        </TabsList>

        {/* Tab Profil Pengguna */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Perbarui informasi profil venue partner Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    type="email"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
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
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Informasi Venue */}
        <TabsContent value="venue" className="space-y-4">
          {venue ? (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Venue</CardTitle>
                <CardDescription>
                  Kelola informasi dasar venue Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue-name">Nama Venue</Label>
                    <Input
                      id="venue-name"
                      value={venueData.name}
                      onChange={(e) =>
                        setVenueData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={venueData.city}
                      onChange={(e) =>
                        setVenueData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Input
                      id="address"
                      value={venueData.address}
                      onChange={(e) =>
                        setVenueData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Telepon Kontak</Label>
                    <Input
                      id="contact-phone"
                      value={venueData.contactPhone}
                      onChange={(e) =>
                        setVenueData((prev) => ({
                          ...prev,
                          contactPhone: e.target.value,
                        }))
                      }
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email Kontak</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={venueData.contactEmail}
                      onChange={(e) =>
                        setVenueData((prev) => ({
                          ...prev,
                          contactEmail: e.target.value,
                        }))
                      }
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Venue</Label>
                  <Textarea
                    id="description"
                    value={venueData.description}
                    onChange={(e) =>
                      setVenueData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    disabled={saving}
                    rows={4}
                  />
                </div>

                <MapSelector
                  value={coordinates}
                  onChange={setCoordinates}
                  disabled={saving}
                  placeholder="Pilih lokasi venue pada peta"
                />

                <div className="flex justify-end">
                  <Button onClick={handleVenueUpdate} disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan Perubahan Venue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    Venue Belum Tersedia
                  </h3>
                  <p className="text-sm">
                    Anda belum memiliki venue yang terdaftar.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
